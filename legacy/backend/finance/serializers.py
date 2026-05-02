from rest_framework import serializers
from decimal import Decimal
from .models import BankAccount, TransactionCategory, Transaction, Invoice, InvoiceItem


class BankAccountSerializer(serializers.ModelSerializer):
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)

    class Meta:
        model = BankAccount
        fields = '__all__'


class TransactionCategorySerializer(serializers.ModelSerializer):
    category_type_display = serializers.CharField(source='get_category_type_display', read_only=True)

    class Meta:
        model = TransactionCategory
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    bank_account_name = serializers.CharField(source='bank_account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    balance_due = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            item_data['total'] = item_data.get('quantity', Decimal('1')) * item_data['unit_price']
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        invoice.recalculate_totals()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                item_data['total'] = item_data.get('quantity', Decimal('1')) * item_data['unit_price']
                InvoiceItem.objects.create(invoice=instance, **item_data)
            instance.recalculate_totals()

        return instance
