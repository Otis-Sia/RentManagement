from django.contrib import admin
from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['house_number', 'address', 'bedrooms', 'bathrooms', 'monthly_rent', 'is_occupied']
    list_filter = ['is_occupied', 'bedrooms', 'bathrooms']
    search_fields = ['house_number', 'address']
    ordering = ['house_number']
