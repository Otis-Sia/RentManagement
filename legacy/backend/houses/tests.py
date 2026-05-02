from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Property

class HouseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.house_data = {
            'house_number': '101',
            'address': '123 Main St',
            'bedrooms': 2,
            'bathrooms': 1,
            'monthly_rent': 1000.00
        }
        self.house = Property.objects.create(**self.house_data)

    def test_create_house_duplicate_house_number_different_address(self):
        """Test creating a house with same number but different address"""
        new_house_data = {
            'house_number': '101',
            'address': '456 Elm St',
            'bedrooms': 3,
            'bathrooms': 2,
            'monthly_rent': 1500.00
        }
        response = self.client.post('/api/houses/', new_house_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Property.objects.count(), 2)

    def test_create_house_duplicate_house_number_same_address(self):
        """Test creating a house with same number and same address should fail"""
        duplicate_data = {
            'house_number': '101',
            'address': '123 Main St',
            'bedrooms': 2,
            'bathrooms': 1,
            'monthly_rent': 1000.00
        }
        response = self.client.post('/api/houses/', duplicate_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Property.objects.count(), 1)

    def test_update_house(self):
        """Test updating a house"""
        url = f'/api/houses/{self.house.id}/'
        updated_data = {
            'house_number': '101',
            'address': '123 Main St',
            'bedrooms': 3, # Changed
            'bathrooms': 1,
            'monthly_rent': 1200.00 # Changed
        }
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.house.refresh_from_db()
        self.assertEqual(self.house.bedrooms, 3)
        self.assertEqual(float(self.house.monthly_rent), 1200.00)

    def test_partial_update_house(self):
        """Test partially updating a house"""
        url = f'/api/houses/{self.house.id}/'
        updated_data = {'monthly_rent': 1300.00}
        response = self.client.patch(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.house.refresh_from_db()
        self.assertEqual(float(self.house.monthly_rent), 1300.00)
