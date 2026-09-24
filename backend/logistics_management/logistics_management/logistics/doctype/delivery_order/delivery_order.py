import frappe
from frappe import _
from frappe.model.document import Document

from logistics_management.exceptions import LogisticsValidationError


WORKFLOW_FIELDS = ("status", "assigned_driver", "delivery_run", "delivered_date")
DELIVERY_DETAIL_FIELDS = ("customer_name", "customer_phone", "address", "cash_amount")


class DeliveryOrder(Document):
    def validate(self):
        if not self.customer_name or not self.address:
            frappe.throw(_("Customer Name and Address are required."), LogisticsValidationError)
        if (self.cash_amount or 0) < 0:
            frappe.throw(_("Cash Amount cannot be negative."), LogisticsValidationError)

        previous = self.get_doc_before_save()
        is_transition = bool(self.flags.get("logistics_transition"))

        if not previous:
            if not is_transition and (
                self.status not in (None, "", "Open")
                or self.assigned_driver
                or self.delivery_run
                or self.delivered_date
            ):
                frappe.throw(
                    _("New orders must start as Open and unassigned."),
                    LogisticsValidationError,
                )
            return

        if not is_transition and any(self.has_value_changed(field) for field in WORKFLOW_FIELDS):
            frappe.throw(
                _("Order workflow fields can only be changed by logistics actions."),
                frappe.PermissionError,
            )

        if previous.status != "Open" and any(
            self.has_value_changed(field) for field in DELIVERY_DETAIL_FIELDS
        ):
            frappe.throw(
                _("Delivery details cannot be changed after an order is assigned."),
                LogisticsValidationError,
            )
