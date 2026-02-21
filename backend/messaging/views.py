from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from tenants.models import Tenant
from payroll.models import Employee
from houses.models import Property
from .models import BroadcastMessage, MessageRecipient
from .serializers import (
    BroadcastMessageListSerializer,
    BroadcastMessageDetailSerializer,
    BroadcastMessageCreateSerializer,
    MessageRecipientSerializer,
)


class BroadcastMessageViewSet(viewsets.ModelViewSet):
    queryset = BroadcastMessage.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return BroadcastMessageCreateSerializer
        if self.action in ('retrieve',):
            return BroadcastMessageDetailSerializer
        return BroadcastMessageListSerializer

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """
        Send (broadcast) a message to its target audience.
        Creates MessageRecipient rows for every matching recipient.
        """
        message = self.get_object()

        if message.is_sent:
            return Response(
                {'detail': 'This message has already been sent.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipients_created = 0

        if message.audience == 'ALL_TENANTS':
            tenants = Tenant.objects.filter(is_active=True)
            for tenant in tenants:
                MessageRecipient.objects.create(
                    message=message,
                    recipient_type='TENANT',
                    tenant=tenant,
                )
                recipients_created += 1

        elif message.audience == 'BUILDING_TENANTS':
            # Find properties matching the building address
            properties = Property.objects.filter(address=message.building_address)
            tenants = Tenant.objects.filter(
                is_active=True,
                property__in=properties,
            )
            for tenant in tenants:
                MessageRecipient.objects.create(
                    message=message,
                    recipient_type='TENANT',
                    tenant=tenant,
                )
                recipients_created += 1

        elif message.audience == 'ALL_EMPLOYEES':
            employees = Employee.objects.filter(is_active=True)
            for employee in employees:
                MessageRecipient.objects.create(
                    message=message,
                    recipient_type='EMPLOYEE',
                    employee=employee,
                )
                recipients_created += 1

        message.is_sent = True
        message.sent_at = timezone.now()
        message.save()

        return Response({
            'detail': f'Message sent to {recipients_created} recipient(s).',
            'recipient_count': recipients_created,
        })

    @action(detail=True, methods=['post'], url_path='mark-read/(?P<recipient_id>[0-9]+)')
    def mark_read(self, request, pk=None, recipient_id=None):
        """Mark a single recipient entry as read."""
        message = self.get_object()
        try:
            recipient = message.recipients.get(pk=recipient_id)
        except MessageRecipient.DoesNotExist:
            return Response(
                {'detail': 'Recipient not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not recipient.is_read:
            recipient.is_read = True
            recipient.read_at = timezone.now()
            recipient.save()

        return Response({'detail': 'Marked as read.'})


@api_view(['GET'])
def building_addresses(request):
    """Return distinct building addresses for the audience picker."""
    addresses = (
        Property.objects.values_list('address', flat=True)
        .distinct()
        .order_by('address')
    )
    return Response(list(addresses))
