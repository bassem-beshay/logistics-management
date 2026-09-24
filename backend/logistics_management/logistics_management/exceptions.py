import frappe


class LogisticsValidationError(frappe.ValidationError):
    """A client-correctable business rule violation."""

    http_status_code = 400
