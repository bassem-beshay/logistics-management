import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt

from logistics_management.exceptions import LogisticsValidationError


WORKFLOW_FIELDS = (
    "driver",
    "run_status",
    "total_cash_collected",
    "started_date",
    "completed_date",
    "cash_banked_date",
    "cash_banked_location",
)


def _stop_state(rows):
    return [
        (
            row.name,
            row.related_order,
            row.stop_sequence,
            row.customer_name,
            row.address,
            flt(row.cash_amount),
            row.stop_status,
            row.delivered_date,
            row.failed_reason,
        )
        for row in rows
    ]


class DeliveryRun(Document):
    def validate(self):
        if self.run_status == "Assigned" and not self.delivery_stops:
            frappe.throw(_("Assigned runs require at least one delivery stop."), LogisticsValidationError)

        sequences = [row.stop_sequence for row in self.delivery_stops]
        if sequences and sorted(sequences) != list(range(1, len(sequences) + 1)):
            frappe.throw(
                _("Delivery stop sequences must be unique and contiguous from 1."),
                LogisticsValidationError,
            )

        related_orders = [row.related_order for row in self.delivery_stops]
        if len(related_orders) != len(set(related_orders)):
            frappe.throw(_("An order can only appear once in a run."), LogisticsValidationError)
        if any(flt(row.cash_amount) < 0 for row in self.delivery_stops):
            frappe.throw(_("Delivery stop cash cannot be negative."), LogisticsValidationError)

        expected_cash = sum(
            flt(row.cash_amount) for row in self.delivery_stops if row.stop_status == "Delivered"
        )
        if flt(self.total_cash_collected) != flt(expected_cash):
            frappe.throw(
                _("Total Cash Collected must equal the cash from delivered stops."),
                LogisticsValidationError,
            )

        if self.run_status == "En Route" and not self.started_date:
            frappe.throw(_("An En Route run requires a Started Date."), LogisticsValidationError)
        if self.run_status in ("Completed", "Cash Banked") and not self.completed_date:
            frappe.throw(_("A completed run requires a Completed Date."), LogisticsValidationError)
        if self.run_status == "Cash Banked" and (
            not self.cash_banked_date or not self.cash_banked_location
        ):
            frappe.throw(
                _("A Cash Banked run requires a date and location."),
                LogisticsValidationError,
            )

        previous = self.get_doc_before_save()
        is_transition = bool(self.flags.get("logistics_transition"))
        if not previous:
            if not is_transition and (self.run_status not in (None, "", "Draft") or self.delivery_stops):
                frappe.throw(
                    _("New runs must start as an empty Draft or be created by Build Run."),
                    frappe.PermissionError,
                )
            return

        workflow_changed = any(self.has_value_changed(field) for field in WORKFLOW_FIELDS)
        stops_changed = _stop_state(self.delivery_stops) != _stop_state(previous.delivery_stops)
        if not is_transition and (workflow_changed or stops_changed):
            frappe.throw(
                _("Run workflow fields and stops can only be changed by logistics actions."),
                frappe.PermissionError,
            )
