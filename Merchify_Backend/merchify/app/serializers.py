import base64

from app.models import *
from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from django.conf import settings


# Helper para codificar imagens em Base64
def encode_image_to_base64(image_field):
    if image_field and hasattr(image_field, 'file') and image_field.file:
        return base64.b64encode(image_field.file.read()).decode('utf-8')
    return None

# Serializer para o modelo Company
class CompanySerializer(serializers.ModelSerializer):
    logo_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'email', 'phone', 'logo_base64']

    def get_logo_base64(self, obj):
        return encode_image_to_base64(obj.logo)

# Serializer para o modelo User
class UserSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'firstname', 'lastname', 'user_type', 'email', 'phone', 'country', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

class ArtistSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ['id', 'name', 'description', 'image_url', 'background_image_url']

    def get_image_url(self, obj):
        if obj.image:
            # Directly use obj.image.url to avoid duplication
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def get_background_image_url(self, obj):
        if obj.background_image:
            # Directly use obj.background_image.url to avoid duplication
            return self.context['request'].build_absolute_uri(obj.background_image.url)
        return None

class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    product_type = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image', 'artist', 'company',
            'category', 'addedProduct', 'count', 'average_rating', 'product_type', 'stock'
        ]

    def get_average_rating(self, obj):
        return obj.get_average_rating()

    def get_product_type(self, obj):
        return obj.get_product_type()

    def get_stock(self, obj):
        return obj.get_stock()

# Serializer para o modelo Size
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size', 'stock']

# Serializer para o modelo Vinil
class VinilSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Vinil
        fields = ['id', 'name', 'genre', 'lpSize', 'releaseDate', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Serializer para o modelo CD
class CDSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = CD
        fields = ['id', 'name', 'genre', 'releaseDate', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Serializer para o modelo Clothing
class ClothingSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()
    sizes = SizeSerializer(many=True, read_only=True)

    class Meta:
        model = Clothing
        fields = ['id', 'name', 'color', 'sizes', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Serializer para o modelo Accessory
class AccessorySerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Accessory
        fields = ['id', 'name', 'material', 'color', 'size', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Serializer para o modelo Cart
class CartSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'date', 'total']

# Serializer para o modelo CartItem
class CartItemSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'quantity', 'size', 'total']

# Serializer para o modelo Favorite
class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'product']

# Serializer para o modelo FavoriteArtist
class FavoriteArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteArtist
        fields = ['id', 'user', 'artist']

# Serializer para o modelo FavoriteCompany
class FavoriteCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteCompany
        fields = ['id', 'user', 'company']

# Serializer para o modelo Purchase
class PurchaseSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = Purchase
        fields = ['id', 'user', 'date', 'paymentMethod', 'shippingAddress', 'status', 'total_amount', 'discount_applied', 'discount_value', 'total']

# Serializer para o modelo Review
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'text', 'rating', 'date']

# Serializer para o modelo PurchaseProduct
class PurchaseProductSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = PurchaseProduct
        fields = ['id', 'purchase', 'product', 'quantity', 'total']
