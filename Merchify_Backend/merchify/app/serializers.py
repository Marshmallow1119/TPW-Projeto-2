import base64
from rest_framework import serializers
from django.contrib.auth.models import User as AuthUser
from django.conf import settings
from app.models import *
from django.core.files.base import ContentFile

# Helper function for encoding images in Base64
def encode_image_to_base64(image_field):
    if image_field and hasattr(image_field, 'file') and image_field.file:
        return base64.b64encode(image_field.file.read()).decode('utf-8')
    return None

# Company Serializer
class CompanySerializer(serializers.ModelSerializer):
    logo_base64 = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(source='getNumberOfProducts', read_only=True)
    average_rating = serializers.FloatField(source='get_average_rating', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'address', 'email', 'phone', 'logo_base64',
            'product_count', 'average_rating'
        ]

    def get_logo_base64(self, obj):
        return encode_image_to_base64(obj.logo) if obj.logo else None

class BalanceSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("The amount must be greater than zero.")
        return value

class UserSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # Para leitura
    company = CompanySerializer(read_only=True)  # Apenas leitura

    class Meta:
        model = User
        fields = [
            'id', 'username', 'firstname', 'lastname', 'user_type',
            'email', 'phone', 'country', 'image', 'balance', 'company', 'address'
        ]

    def get_image(self, obj):
        return encode_image_to_base64(obj.image) if obj.image else None

    def update(self, instance, validated_data):
        # Verificar se a imagem é um Base64
        image_base64 = self.initial_data.get('image')
        if image_base64:
            try:
                # Remover prefixo "data:image/*;base64,"
                format, imgstr = image_base64.split(';base64,')
                ext = format.split('/')[-1]
                instance.image.save(
                    f"{instance.username}.{ext}",
                    ContentFile(base64.b64decode(imgstr)),
                    save=False
                )
            except Exception as e:
                raise serializers.ValidationError(f"Erro ao processar imagem: {e}")
        
        # Atualizar outros campos normalmente
        instance.firstname = validated_data.get('firstname', instance.firstname)
        instance.lastname = validated_data.get('lastname', instance.lastname)
        instance.email = validated_data.get('email', instance.email)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.country = validated_data.get('country', instance.country)
        instance.address = validated_data.get('address', instance.address)
        
        instance.save()
        return instance


# Artist Serializer
class ArtistSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ['id', 'name', 'description', 'image_url', 'background_image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if obj.image and request else None

    def get_background_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.background_image.url) if obj.background_image and request else None

# Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(source='get_average_rating', read_only=True)
    product_type = serializers.CharField(source='get_product_type', read_only=True)
    stock = serializers.IntegerField(source='get_stock', read_only=True)
    specific_details = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    artist= ArtistSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'image_url', 'artist', 'company',
            'category', 'addedProduct', 'count', 'average_rating',
            'product_type', 'stock', 'specific_details','old_price','is_on_promotion'
        ]

    def get_specific_details(self, obj):
        """Return specific details based on product type."""
        product_type = obj.get_product_type()
        serializers_map = {
            'Vinil': VinilSerializer,
            'CD': CDSerializer,
            'Clothing': ClothingSerializer,
            'Accessory': AccessorySerializer,
        }
        serializer_class = serializers_map.get(product_type)
        instance = getattr(obj, product_type.lower(), None)
        return serializer_class(instance, context=self.context).data if instance else {}

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if obj.image and request else None
    
# Size Serializer
class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size', 'stock']

# Vinil Serializer
class VinilSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Vinil
        fields = ['id', 'name', 'genre', 'lpSize', 'releaseDate', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# CD Serializer
class CDSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = CD
        fields = ['id', 'name', 'genre', 'releaseDate', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Clothing Serializer
class ClothingSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()
    sizes = SizeSerializer(many=True, read_only=True)

    class Meta:
        model = Clothing
        fields = ['id', 'name', 'color', 'sizes', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Accessory Serializer
class AccessorySerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Accessory
        fields = ['id', 'name', 'material', 'color', 'size', 'stock', 'image_base64']

    def get_image_base64(self, obj):
        return encode_image_to_base64(obj.image)

# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'date', 'total']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Nested serializer for product d
    size = SizeSerializer(read_only=True)  # Nested serializer for size details
    total = serializers.ReadOnlyField()  # Use the `total` property from the mode

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'quantity', 'size', 'total']

# Favorite Serializers
class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'product']

class FavoriteArtistSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = FavoriteArtist
        fields = ['id', 'user', 'artist']

class FavoriteCompanySerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = FavoriteCompany
        fields = ['id', 'user', 'company']

# Purchase Serializer
class PurchaseSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()
    products= serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = [
            'id', 'user', 'date', 'paymentMethod', 'shippingAddress',
            'status', 'total_amount', 'discount_applied', 'discount_value', 'total','products'
        ]
    def get_products(self, obj):
        # Usa o serializer de produtos associados
        purchase_products = PurchaseProduct.objects.filter(purchase=obj)

        return PurchaseProductSerializer(purchase_products, many=True).data

# Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'text', 'rating', 'date']

# PurchaseProduct Serializer
class PurchaseProductSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    total = serializers.ReadOnlyField()

    class Meta:
        model = PurchaseProduct
        fields = ['id', 'purchase', 'product','product_details', 'quantity', 'total']

# Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password1', 'password2', 'user_type', 'phone', 'country', 'image'
        ]

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        return user

class ChatSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'user', 'company', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    chat = ChatSerializer(read_only=True)
    is_from_company = serializers.BooleanField(read_only=True)
    text = serializers.CharField()
    date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'is_from_company', 'text', 'date']

