from django.contrib import admin
from .models import BroadcastMessage, MessageRecipient


class MessageRecipientInline(admin.TabularInline):
    model = MessageRecipient
    extra = 0
    readonly_fields = ('recipient_type', 'tenant', 'employee', 'is_read', 'read_at')


@admin.register(BroadcastMessage)
class BroadcastMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'audience', 'priority', 'is_sent', 'sent_at', 'created_at')
    list_filter = ('audience', 'priority', 'is_sent')
    search_fields = ('subject', 'body')
    inlines = [MessageRecipientInline]
    readonly_fields = ('is_sent', 'sent_at', 'created_at')


@admin.register(MessageRecipient)
class MessageRecipientAdmin(admin.ModelAdmin):
    list_display = ('message', 'recipient_type', 'tenant', 'employee', 'is_read', 'read_at')
    list_filter = ('recipient_type', 'is_read')
    raw_id_fields = ('message', 'tenant', 'employee')
