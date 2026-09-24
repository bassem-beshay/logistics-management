import frappe
from frappe.tests.utils import FrappeTestCase

from logistics_management import api
from logistics_management.exceptions import LogisticsValidationError


class TestLogisticsWorkflow(FrappeTestCase):
    def setUp(self):
        frappe.set_user("Administrator")
        self.suffix = frappe.generate_hash(length=8).lower()
        self.manager = self._make_user("manager", "Logistics Manager")
        self.dispatcher = self._make_user("dispatcher", "Logistics Dispatcher")
        self.driver_user = self._make_user("driver", "Logistics Driver")
        self.other_driver_user = self._make_user("other-driver", "Logistics Driver")
        self.driver = self._make_driver("Primary", self.driver_user)
        self.other_driver = self._make_driver("Other", self.other_driver_user)

    def tearDown(self):
        frappe.set_user("Administrator")

    def _make_user(self, label, role):
        email = f"logistics-{label}-{self.suffix}@example.com"
        user = frappe.get_doc(
            {
                "doctype": "User",
                "email": email,
                "first_name": f"Logistics {label}",
                "enabled": 1,
                "user_type": "System User",
                "send_welcome_email": 0,
            }
        ).insert(ignore_permissions=True)
        user.add_roles(role)
        return email

    def _make_driver(self, label, user, max_stops=3):
        return frappe.get_doc(
            {
                "doctype": "Driver",
                "driver_name": f"{label} Driver {self.suffix}",
                "phone_number": "01000000000",
                "user": user,
                "active": 1,
                "max_stops_per_run": max_stops,
            }
        ).insert(ignore_permissions=True)

    def _make_order(self, customer, cash):
        frappe.set_user(self.dispatcher)
        return frappe.get_doc(
            {
                "doctype": "Delivery Order",
                "customer_name": customer,
                "customer_phone": "01011111111",
                "address": "Cairo",
                "cash_amount": cash,
                "priority": "High",
            }
        ).insert()

    def _build_and_start(self, orders):
        frappe.set_user(self.dispatcher)
        result = api.build_delivery_run(self.driver.name, [order.name for order in orders])
        api.start_delivery_run(result["run"])
        return frappe.get_doc("Delivery Run", result["run"])

    def test_end_to_end_run_and_cash_banking(self):
        delivered_order = self._make_order("Delivered Customer", 500)
        failed_order = self._make_order("Failed Customer", 300)

        frappe.set_user(self.dispatcher)
        result = api.build_delivery_run(
            self.driver.name, [delivered_order.name, failed_order.name]
        )
        run = frappe.get_doc("Delivery Run", result["run"])
        self.assertEqual(run.run_status, "Assigned")
        self.assertEqual([row.stop_sequence for row in run.delivery_stops], [1, 2])
        self.assertEqual(
            frappe.db.get_value("Delivery Order", delivered_order.name, "status"), "Assigned"
        )

        api.start_delivery_run(run.name)
        run.reload()
        self.assertEqual(run.run_status, "En Route")
        self.assertEqual(frappe.db.get_value("Driver", self.driver.name, "status"), "On Run")

        frappe.set_user(self.driver_user)
        api.mark_stop_delivered(run.name, run.delivery_stops[0].name)
        api.mark_stop_failed(run.name, run.delivery_stops[1].name, "Customer unavailable")
        run.reload()
        self.assertEqual(run.total_cash_collected, 500)
        self.assertEqual(run.delivery_stops[0].stop_status, "Delivered")
        self.assertEqual(run.delivery_stops[1].stop_status, "Failed")

        api.complete_delivery_run(run.name)
        self.assertEqual(frappe.db.get_value("Driver", self.driver.name, "status"), "Available")

        frappe.set_user(self.manager)
        api.bank_cash(run.name, "Main office")
        run.reload()
        self.assertEqual(run.run_status, "Cash Banked")
        self.assertEqual(run.cash_banked_location, "Main office")
        self.assertEqual(
            frappe.db.get_value("Delivery Order", delivered_order.name, "status"), "Cash Banked"
        )
        self.assertEqual(
            frappe.db.get_value("Delivery Order", failed_order.name, "status"), "Failed"
        )

    def test_non_open_order_and_driver_capacity_are_rejected(self):
        first = self._make_order("First", 10)
        second = self._make_order("Second", 20)
        third = self._make_order("Third", 30)
        fourth = self._make_order("Fourth", 40)

        frappe.set_user(self.dispatcher)
        with self.assertRaises(LogisticsValidationError):
            api.build_delivery_run(
                self.driver.name, [first.name, second.name, third.name, fourth.name]
            )

        api.build_delivery_run(self.driver.name, [first.name])
        with self.assertRaises(LogisticsValidationError):
            api.build_delivery_run(self.other_driver.name, [first.name])

    def test_driver_cannot_update_another_drivers_stop(self):
        order = self._make_order("Protected Customer", 90)
        run = self._build_and_start([order])

        frappe.set_user(self.other_driver_user)
        with self.assertRaises(frappe.PermissionError):
            api.mark_stop_delivered(run.name, run.delivery_stops[0].name)

        self.assertEqual(
            frappe.db.get_value("Delivery Order", order.name, "status"), "En Route"
        )

    def test_direct_rest_style_workflow_changes_are_blocked(self):
        order = self._make_order("Workflow Customer", 110)
        frappe.set_user(self.manager)
        order.reload()
        order.status = "Failed"
        with self.assertRaises(frappe.PermissionError):
            order.save()

        frappe.set_user(self.dispatcher)
        result = api.build_delivery_run(self.driver.name, [order.name])
        frappe.set_user(self.manager)
        run = frappe.get_doc("Delivery Run", result["run"])
        run.run_status = "Cancelled"
        with self.assertRaises(frappe.PermissionError):
            run.save()

    def test_driver_on_run_cannot_be_deactivated(self):
        order = self._make_order("Active Customer", 125)
        self._build_and_start([order])

        frappe.set_user(self.dispatcher)
        driver = frappe.get_doc("Driver", self.driver.name)
        driver.active = 0
        with self.assertRaises(LogisticsValidationError):
            driver.save()

        self.assertEqual(frappe.db.get_value("Driver", self.driver.name, "status"), "On Run")

    def test_validation_rejects_invalid_driver_and_order_values(self):
        frappe.set_user(self.dispatcher)
        with self.assertRaises(LogisticsValidationError):
            frappe.get_doc(
                {
                    "doctype": "Driver",
                    "driver_name": f"Invalid Driver {self.suffix}",
                    "phone_number": "01022222222",
                    "max_stops_per_run": 0,
                }
            ).insert()

        with self.assertRaises(LogisticsValidationError):
            frappe.get_doc(
                {
                    "doctype": "Delivery Order",
                    "customer_name": "Invalid Cash",
                    "address": "Cairo",
                    "cash_amount": -1,
                }
            ).insert()
