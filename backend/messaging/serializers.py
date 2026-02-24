from rest_framework import serializers
from .models import BroadcastMessage, MessageRecipient


class MessageRecipientSerializer(serializers.ModelSerializer):
    recipient_name = serializers.ReadOnlyField()
    recipient_email = serializers.ReadOnlyField()
    recipient_phone = serializers.ReadOnlyField()

    class Meta:
        model = MessageRecipient
        fields = [
            'id', 'recipient_type', 'tenant', 'employee',
            'recipient_name', 'recipient_email', 'recipient_phone',
            'whatsapp_status', 'whatsapp_sent_at',
            'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class BroadcastMessageListSerializer(serializers.ModelSerializer):
    recipient_count = serializers.ReadOnlyField()
    read_count = serializers.ReadOnlyField()
    whatsapp_sent_count = serializers.ReadOnlyField()

    class Meta:
        model = BroadcastMessage
        fields = [
            'id', 'subject', 'body', 'audience', 'building_address',
            'priority', 'is_sent', 'sent_at', 'created_at',
            'recipient_count', 'read_count', 'whatsapp_sent_count',
        ]
        read_only_fields = ['id', 'is_sent', 'sent_at', 'created_at']


class BroadcastMessageDetailSerializer(serializers.ModelSerializer):
    recipient_count = serializers.ReadOnlyField()
    read_count = serializers.ReadOnlyField()
    whatsapp_sent_count = serializers.ReadOnlyField()
    recipients = MessageRecipientSerializer(many=True, read_only=True)

    class Meta:
        model = BroadcastMessage
        fields = [
            'id', 'subject', 'body', 'audience', 'building_address',
            'priority', 'is_sent', 'sent_at', 'created_at',
            'recipient_count', 'read_count', 'whatsapp_sent_count', 'recipients',
        ]
        read_only_fields = ['id', 'is_sent', 'sent_at', 'created_at']


class BroadcastMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BroadcastMessage
        fields = ['id', 'subject', 'body', 'audience', 'building_address', 'priority']
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('audience') == 'BUILDING_TENANTS' and not data.get('building_address'):
            raise serializers.ValidationError({
                'building_address': 'Building address is required when targeting tenants in a specific building.'
            })
        return data
