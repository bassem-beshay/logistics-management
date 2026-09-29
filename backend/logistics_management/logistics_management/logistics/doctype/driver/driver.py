import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import cint

from logistics_management.exceptions import LogisticsValidationError


class Driver(Document):
    def validate(self):
        if not self.phone_number:
            frappe.throw(_("Phone Number is required."), LogisticsValidationError)
        if cint(self.max_stops_per_run) <= 0:
            frappe.throw(_("Max Stops Per Run must be greater than zero."), LogisticsValidationError)

        previous = self.get_doc_before_save()
        is_transition = bool(self.flags.get("logistics_transition"))

        if previous and previous.status == "On Run" and not self.active:
            frappe.throw(_("A driver on an active run cannot be deactivated."), LogisticsValidationError)

        if is_transition:
            if not self.active and self.status != "Inactive":
                frappe.throw(_("An inactive driver must have Inactive status."), LogisticsValidationError)
            if self.status == "On Run" and not self.active:
                frappe.throw(_("An inactive driver cannot be placed On Run."), LogisticsValidationError)
            return

        # Status is derived from Active outside secure workflow actions. This also
        # neutralizes attempts to set the read-only status field through REST.
        if previous and previous.status == "On Run":
            self.status = "On Run"
        else:
            self.status = "Available" if self.active else "Inactive"
