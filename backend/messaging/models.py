from django.db import models


class BroadcastMessage(models.Model):
    """A message broadcast to a group of recipients."""

    AUDIENCE_CHOICES = [
        ('ALL_TENANTS', 'All Active Tenants'),
        ('BUILDING_TENANTS', 'Tenants in a Specific Building'),
        ('ALL_EMPLOYEES', 'All Active Employees'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    subject = models.CharField(max_length=255)
    body = models.TextField()
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES)
    building_address = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Required when audience is BUILDING_TENANTS. "
                  "Use the property address to target a specific building."
    )
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='NORMAL')
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_audience_display()}] {self.subject}"

    @property
    def recipient_count(self):
        return self.recipients.count()

    @property
    def read_count(self):
        return self.recipients.filter(is_read=True).count()

    @property
    def whatsapp_sent_count(self):
        return self.recipients.filter(whatsapp_status='SENT').count()


class MessageRecipient(models.Model):
    """Tracks each individual recipient of a broadcast message."""

    RECIPIENT_TYPE_CHOICES = [
        ('TENANT', 'Tenant'),
        ('EMPLOYEE', 'Employee'),
    ]

    WHATSAPP_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]

    message = models.ForeignKey(
        BroadcastMessage,
        on_delete=models.CASCADE,
        related_name='recipients'
    )
    recipient_type = models.CharField(max_length=10, choices=RECIPIENT_TYPE_CHOICES)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='received_messages'
    )
    employee = models.ForeignKey(
        'payroll.Employee',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='received_messages'
    )
    whatsapp_status = models.CharField(
        max_length=10,
        choices=WHATSAPP_STATUS_CHOICES,
        default='PENDING',
    )
    whatsapp_sent_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['recipient_type', 'created_at']

    def __str__(self):
        name = ''
        if self.tenant:
            name = self.tenant.name
        elif self.employee:
            name = self.employee.full_name
        return f"{name} - {self.message.subject}"

    @property
    def recipient_name(self):
        if self.tenant:
            return self.tenant.name
        elif self.employee:
            return self.employee.full_name
        return 'Unknown'

    @property
    def recipient_email(self):
        if self.tenant:
            return self.tenant.email
        elif self.employee:
            return self.employee.email
        return ''

    @property
    def recipient_phone(self):
        if self.tenant:
            return self.tenant.phone
        elif self.employee:
            return self.employee.phone
        return ''
