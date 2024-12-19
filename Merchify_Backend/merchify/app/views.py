import base64
from decimal import Decimal
import json
import logging
import re
from datetime import date
from urllib.parse import urlencode

# Django Core Imports
from django.conf import settings
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group, User as AuthUser
from django.contrib import messages
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction, IntegrityError
from django.db.models import Avg, Q, Count
from django.http import JsonResponse, Http404
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse, resolve, Resolver404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import jwt
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now
from django.contrib.auth import update_session_auth_hash
from django.core.files.storage import default_storage




# Django Forms and Validation
from .forms import (
    ReviewForm, RegisterForm, ProductForm, CompanyForm, UserForm,
    VinilForm, CDForm, ClothingForm, AccessoryForm,
    UploadUserProfilePicture, UpdatePassword, UpdateProfile
)
from django.core.exceptions import PermissionDenied
from django.contrib.auth import password_validation

from app.models import (
    Chat, Product, Company, Cart, CartItem, Purchase, User, Vinil, CD, Clothing, Accessory,
    Size, Favorite, FavoriteArtist, FavoriteCompany, Artist, Review, PurchaseProduct, Message
)

logger = logging.getLogger(__name__)

from rest_framework import status
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes
)
from app.serializers import BalanceSerializer, CartItemSerializer, ChatSerializer, FavoriteArtistSerializer, FavoriteCompanySerializer, FavoriteSerializer, LoginSerializer, PurchaseProductSerializer, PurchaseSerializer, RegisterSerializer, ReviewSerializer, ReviewSerializer, UserSerializer, ProductSerializer, CompanySerializer, ArtistSerializer

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authtoken.models import Token

from json import loads

@api_view(['GET'])
def home(request):
    try:
        artists = Artist.objects.all()
        recent_products = Product.objects.order_by('-addedProduct')[:20]

        artists_data = ArtistSerializer(artists, many=True, context={'request': request}).data
        recent_products_data = ProductSerializer(recent_products, many=True, context={'request': request}).data
        return Response({
            'artists': artists_data,
            'recent_products': recent_products_data,
        })
    except Exception as e:
        logger.error(f"Error in home view: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def balance(request):
    user = request.user

    if request.method == 'GET':
        return Response({'user': user.username, 'balance': str(user.balance)})

    elif request.method in ['POST', 'PUT']:
        serializer = BalanceSerializer(data=request.data)
        if serializer.is_valid():
            amount = serializer.validated_data['amount']

            if Decimal(amount) <= 0:
                return Response({'error': 'Amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)


            if request.method == 'POST':
                user.balance += Decimal(amount)
                user.save()
                return Response({
                    'message': 'Balance added successfully!',
                    'user': user.username,
                    'new_balance': str(user.balance)
                })

            elif request.method == 'PUT':

                if user.balance < Decimal(amount):
                    return Response({'error': 'Insufficient balance.'}, status=status.HTTP_400_BAD_REQUEST)
                
                if user.balance - Decimal(amount) < 0:
                    return Response({'error': 'Insufficient balance, cannot deduct more than the available balance.'}, 
                                    status=status.HTTP_400_BAD_REQUEST)


                user.balance -= Decimal(amount)
                user.save()
                return Response({
                    'message': 'Balance deducted successfully!',
                    'user': user.username,
                    'new_balance': str(user.balance)
                })

        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'error': 'Invalid request method.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
def companhias(request):
    companies = Company.objects.all()

    if request.user.is_authenticated:
        favorited_company_ids = FavoriteCompany.objects.filter(user=request.user).values_list('company_id', flat=True)
    else:
        favorited_company_ids = []

    serializer = CompanySerializer(companies, many=True, context={'request': request})
    companies_data = serializer.data

    for company in companies_data:
        company_id = company['id']
        company['is_favorited'] = company_id in favorited_company_ids

    return Response(companies_data)


@api_view(['GET', 'PUT','DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == 'GET':

        user_serializer = UserSerializer(user)
        purchases = Purchase.objects.filter(user=user)

        purchase_serializer = PurchaseSerializer(purchases, many=True)

        return Response({
            'user': user_serializer.data,
            'number_of_purchases': purchases.count(),
            'purchases': purchase_serializer.data
        })

    elif request.method == 'PUT':

        data = request.data

        if 'submit_password' in data:
            # Handling password change
            old_password = data.get('old_password')
            new_password = data.get('new_password')
            confirm_new_password = data.get('confirm_new_password')

            if not old_password or not new_password or not confirm_new_password:
                raise ValidationError("Todos os campos de senha são obrigatórios.")
            
            if not user.check_password(old_password):
                raise ValidationError("Senha antiga incorreta.")
            
            if new_password != confirm_new_password:
                raise ValidationError("As novas senhas não coincidem.")
            
            try:
                user.set_password(new_password)
                user.save()
                update_session_auth_hash(request, user) 
                return Response({'message': 'Senha alterada com sucesso.'}, status=status.HTTP_200_OK)
            except ValidationError as e:
                raise ValidationError(e.messages)
        
        else:

            data = request.data

            if 'image' in request.FILES:  
                profile_image = request.FILES['image']
                user.image = profile_image  

            if 'firstname' in data:
                user.firstname = data.get('firstname')
            if 'lastname' in data:
                user.lastname = data.get('lastname')
            if 'email' in data:
                user.email = data.get('email')
            if 'address' in data:
                user.address = data.get('address')
            if 'country' in data:
                user.country = data.get('country')

            phone = data.get('phone')
            if phone and not re.fullmatch(r'\d{9}', phone):
                raise ValidationError("O número de telefone deve conter exatamente 9 dígitos.")
            if 'phone' in data:
                user.phone = phone

            user.save()

            updated_user_serializer = UserSerializer(user)
            return Response({'message': 'Perfil atualizado com sucesso.', 'user': updated_user_serializer.data})

    elif request.method == 'DELETE':
        user.delete()
        return Response({'message': 'Conta eliminada com sucesso.'}, status=status.HTTP_200_OK)
        
    else:
        return Response({'error': 'Método não suportado.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return Response({"Deleted with sucess"})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_promotion(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    data = request.data

    new_price = data.get('new_price')

    if not new_price:
        return Response({'error': 'New price is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    old_price = product.price
    
    product.old_price = old_price
    product.price = new_price
    product.is_on_promotion = True
    product.save()

    return Response({
        'message': 'Promoção aplicada com sucesso!',
        'old_price': old_price,
        'new_price': new_price,
        'current_price': product.price,  
        'is_on_promotion': product.is_on_promotion
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def cancel_promotion(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if not product.is_on_promotion:
        return Response({'error': 'O produto não está em promoção.'}, status=status.HTTP_400_BAD_REQUEST)

    product.price = product.old_price
    product.old_price = None
    product.is_on_promotion = False
    product.save()

    return Response({'message': 'Promoção cancelada com sucesso!'})


@api_view(['GET'])
def artistas(request):
    artists = Artist.objects.all()

    if request.user.is_authenticated:
        favorited_artist_ids = FavoriteArtist.objects.filter(user=request.user).values_list('artist_id', flat=True)
    else:
        favorited_artist_ids = []

    serializer = ArtistSerializer(artists, many=True, context={'request': request})
    artists_data = serializer.data

    for artist_data in artists_data:
        artist_data['is_favorited'] = int(artist_data['id']) in favorited_artist_ids

    return Response(artists_data)


@api_view(['GET'])
def artistsProducts(request, name):
    try:
        artist = get_object_or_404(Artist, name=name)
    except Exception as e:
        return JsonResponse({'error': 'Artista não encontrado'}, status=404)

    try:
        products = Product.objects.filter(artist=artist)

        if request.user.is_authenticated:
            favorited_product_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
        else:
            favorited_product_ids = []

        serializer_context = {'request': request}
        product_serializer = ProductSerializer(products, many=True, context=serializer_context)
        products_data = product_serializer.data

        for product_data in products_data:
            product_data['is_favorited'] = product_data['id'] in favorited_product_ids

        genres = list(Vinil.objects.values_list('genre', flat=True).distinct())
        colors = list(Clothing.objects.values_list('color', flat=True).distinct())

        artist_serializer = ArtistSerializer(artist, context=serializer_context)

        response_data = {
            'artist': artist_serializer.data,
            'products': products_data,
            'genres': genres,
            'colors': colors,
        }

        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': 'Erro interno do servidor'}, status=500)

@api_view(['GET', 'DELETE', 'PUT'])
def productDetails(request, identifier):
    if request.method == 'GET':
        product = get_object_or_404(Product, id=identifier)
        product.count += 0.5
        product.save()
        company_data = CompanySerializer(product.company).data if product.company else None

        product_serializer = ProductSerializer(product, context={'request': request})
        
        reviews = product.reviews.all()
        review_serializer = ReviewSerializer(reviews, many=True)
        product_data = product_serializer.data
        product_data['reviews'] = review_serializer.data

        return Response(product_data)

    elif request.method == 'DELETE':
        if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
            raise PermissionDenied
        product = get_object_or_404(Product, id=identifier)
        product.delete()
        return Response({'message': 'Produto excluído com sucesso!'})

    elif request.method == 'PUT':
        if not (request.user.is_authenticated and (request.user.user_type == 'admin' or request.user.user_type == 'company')):
            raise PermissionDenied("You do not have permission to update this product.")


        specific_details_json = request.data.get('specific_details', '{}')  
        try:
            specific_details = json.loads(specific_details_json) 
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON for specific_details"}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, id=identifier)

        product.name = request.data.get('name', product.name)
        product.description = request.data.get('description', product.description)
        product.price = request.data.get('price', product.price)

        product_type = product.category.lower() 


        if product_type == 'vinyl':
            productUpdated = Vinil.objects.filter(id=identifier).update(
                genre=specific_details.get('genre', product.vinil.genre),
                lpSize=specific_details.get('lpSize', product.vinil.lpSize),
                releaseDate=specific_details.get('releaseDate', product.vinil.releaseDate),
            )

        elif product_type == 'cd':
            productUpdated = CD.objects.filter(id=identifier).update(
                genre=specific_details.get('genre', product.cd.genre),
                releaseDate=specific_details.get('releaseDate', product.cd.releaseDate),
            )

        elif product_type == 'clothing':
            productUpdated = Clothing.objects.filter(id=identifier).update(
                price = request.data.get('price', product.price),
                color=specific_details.get('color', product.clothing.color)
            )
        elif product_type == 'accessory':
            productUpdated = Accessory.objects.filter(id=identifier).update(
                material=specific_details.get('material', product.accessory.material),
                color=specific_details.get('color', product.accessory.color),
            )

 
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            product.image = image_file 

        product.save()

        updated_product = ProductSerializer(product, context={'request': request})
        return Response(updated_product.data, status=status.HTTP_200_OK)




@api_view(['GET'])
def search(request):
    query = request.GET.get('search', '').strip()
    
    if query:
        products = Product.objects.filter(Q(name__icontains=query)).exclude(name='')
        artists = Artist.objects.filter(name__icontains=query).exclude(name__isnull=True).exclude(name='')
    else:
        products = Product.objects.none()
        artists = Artist.objects.none()

    artists_results = ArtistSerializer(artists, many=True, context={'request': request}).data
    product_results = ProductSerializer(products, many=True, context={'request': request}).data
    return Response({
        'products': product_results,
        'artists': artists_results,
        'query': query,
    })


@api_view(['GET', 'POST'])
def produtos(request):
    if request.method == 'GET':
        produtos = Product.objects.all()
        serializer = ProductSerializer(produtos, many=True, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'POST':
        if not (request.user.is_authenticated and (request.user.user_type == 'company' or request.user.user_type == 'admin')):
            raise PermissionDenied("You do not have permission to add products.")

        name = request.data.get('name')
        description = request.data.get('description')
        price = request.data.get('price')
        product_type = request.data.get('productType')
        artist_id = request.data.get('artist')
        image_file = request.FILES.get('image')
        company_id = request.data.get('company') 

        if not all([name, description, price, product_type]):
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        specific_details = request.data.get('specific_details', '{}')
        try:
            specific_details = json.loads(specific_details)
        except json.JSONDecodeError:
            return Response({"error": "Invalid specific_details format."}, status=status.HTTP_400_BAD_REQUEST)

        artist_obj = get_object_or_404(Artist, id=artist_id)

        company_obj = None
        if request.user.user_type == 'company':
            company_obj = request.user.company
        elif request.user.user_type == 'admin' and company_id: 
            company_obj = get_object_or_404(Company, id=company_id)


        if product_type == 'vinil':
              product = Vinil.objects.create(
                name=name,
                description=description,
                price=price,
                category='Vinyl',
                artist=artist_obj,
                company=company_obj,
                image=image_file,
                genre=specific_details.get('genre'),
                lpSize=specific_details.get('lpSize'),
                releaseDate=specific_details.get('releaseDate'),
                stock=0
            )
        elif product_type == 'cd':
              product = CD.objects.create(
                name=name,
                description=description,
                category='CD',
                price=price,
                artist=artist_obj,
                company=company_obj,
                image=image_file,
                genre=specific_details.get('genre'),
                releaseDate=specific_details.get('releaseDate'),
                stock=0
            )
        elif product_type == 'clothing':
            product = Clothing.objects.create(
                name=name,
                description=description,
                category='Clothing',
                price=price,
                artist=artist_obj,
                company=company_obj,
                image=image_file,
                color=0
            )
        elif product_type == 'accessory':
              product = Accessory.objects.create(
                name=name,
                description=description,
                price=price,
                category='Accessory',
                artist=artist_obj,
                company=company_obj,
                image=image_file,
                material=specific_details.get('material'),
                color=specific_details.get('color'),
                size=specific_details.get('size'),
                stock=0
            )

        product_serializer = ProductSerializer(product, context={'request': request})
        return Response(product_serializer.data, status=status.HTTP_201_CREATED)




@api_view(['POST'])
def register_view(request):
    data = request.data

    print(data)
    errors = {}

    if 'first_name' not in data or not data['first_name']:
        errors['first_name'] = 'Primeiro nome é um campo obrigatório.'


    if 'last_name' not in data or not data['last_name']:
        errors['last_name'] = 'Último nome é um campo obrigatório.'

    if 'username' not in data or not data['username']:
        errors['username'] = 'Nome de utilizador é um campo obrigatório.'


    if 'email' not in data or not data['email']:
        errors['email'] = 'Email é um campo obrigatório.'

    if 'phone' not in data or not data['phone']:
        errors['phone'] = 'Telefone é um campo obrigatório.'

    if 'country' not in data or not data['country']:
        errors['country'] = 'País é um campo obrigatório.'

    if 'password1' not in data or not data['password1']:
        errors['password1'] = 'Password é um campo obrigatório.'

    if 'password2' not in data or not data['password2']:
        errors['password2'] = 'Confirmação de password é um campo obrigatório.'
    
    if data.get('password1') != data.get('password2'):
        errors['password2'] = "As passwords não coincidem."

    phone_pattern = r'^[9|2][0-9]{8}$'
    if not re.match(phone_pattern, data.get('phone', '')):
        errors['phone'] = 'Número de telefone inválido. Deve conter 9 dígitos e começar por 9 ou 2.'

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password1'], 
            phone=data['phone'],
            country=data['country'],
            user_type='individual'
        )

        if 'image' in data and data['image']:
            user.image = data['image']

        
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Utilizador registado com sucesso!',
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'username': user.username,
            'id': user.id,
        }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        if 'app_user.phone' in str(e):
            return Response({'errors': {'phone': ['Este número de telefone já está em uso.']}},
                            status=status.HTTP_400_BAD_REQUEST)
        elif 'app_user.email' in str(e):
            return Response({'errors': {'email': ['Este e-mail já está em uso.']}},
                            status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'errors': {'non_field_errors': ['Erro ao criar o usuário. Tente novamente.']}},
                             status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user.banned:
        user.banned = False
    else:
        user.banned = True
    user.save()
    return JsonResponse({'message': 'Utilizador banido com sucesso!'})


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if hasattr(user, 'banned') and user.banned: 
                print("aaa")
                return Response({"error": "User is banned."}, status=status.HTTP_403_FORBIDDEN)
            
            user_data = UserSerializer(user).data
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def validate_token(request):
    token = request.data.get('token')
    if not token:
        return Response({"error": "Token is required"}, status=400)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        
        user = User.objects.get(id=payload['user_id'])
        
        return Response({
            "user": UserSerializer(user).data,
        })
    
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=401)
    except jwt.InvalidTokenError:
        return Response({"error": "Invalid token"}, status=401)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@login_required
def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)  
    return redirect('home')

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    if request.method == "POST":
        try:
            if not isinstance(request.user, User):
                return JsonResponse({"error": "User is not authenticated."}, status=400)
            
            data = json.loads(request.body)
            quantity = int(data.get("quantity", 1))
            size_id = data.get("size") 

            product = get_object_or_404(Product, id=product_id)
            
            size = None
            if product.get_product_type() == 'Clothing':
                if not size_id:
                    return JsonResponse({"error": "Size is required for clothing items."}, status=400)
                size = get_object_or_404(Size, id=size_id)
            
            cart, created = Cart.objects.get_or_create(user=request.user, defaults={"date": date.today()})
            
            cart_item, item_created = CartItem.objects.get_or_create(
                cart=cart, 
                product=product, 
                size=size,  
                defaults={"quantity": quantity}
            )

            if not item_created:
                cart_item.quantity += quantity
                cart_item.save()

            return JsonResponse({"message": "Produto adicionado ao carrinho!"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_cart(request, user_id=None, product_id=None, item_id=None):
    """
    View for managing the shopping cart:
    - GET: Retrieve all cart items for the user.
    - POST: Add an item to the cart.
    - PUT: Update the quantity of an item in the cart.
    - DELETE: Remove an item from the cart.
    """

    if not user_id or user_id != request.user.id:
        return Response({"error": "Acesso não autorizado."}, status=status.HTTP_403_FORBIDDEN)

    cart, created = Cart.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        try:
            cart_items = CartItem.objects.filter(cart=cart)
            serializer = CartItemSerializer(cart_items, many=True)
            return Response({"cart_items": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        if product_id:
            try:
                data = json.loads(request.body)
                quantity = int(data.get("quantity", 1))
                size_id = data.get("size")
                product = get_object_or_404(Product, id=product_id)
    
                stock_available = None
                size = None
                if product.get_product_type() == 'Clothing' and size_id:
                    size = get_object_or_404(Size, id=size_id)
                    stock_available = size.stock
                else:
                    stock_available = product.get_stock()
    
                cart_item, item_created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    size=size if product.get_product_type() == 'Clothing' else None,
                    defaults={"quantity": quantity}
                )
    
                combined_quantity = quantity if item_created else cart_item.quantity + quantity
    
                if stock_available is not None and combined_quantity > stock_available:
                    return Response(
                        {
                            "error": f"Quantidade total excede o estoque. Disponível: {stock_available}, quantidade solicitada: {quantity}"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
    
                if not item_created:
                    cart_item.quantity = combined_quantity
                    cart_item.save()

                if product.get_product_type() == 'Vinil':
                    product.vinil.stock -= quantity
                    product.vinil.stock = max(0, product.vinil.stock)
                    product.vinil.save()
                elif product.get_product_type() == 'CD':
                    product.cd.stock -= quantity
                    product.cd.stock = max(0, product.cd.stock)
                    product.cd.save()
                elif product.get_product_type() == 'Clothing':
                    size.stock -= quantity
                    size.stock = max(0, size.stock)
                    size.save()
                elif product.get_product_type() == 'Accessory':
                    product.accessory.stock -= quantity
                    product.accessory.stock = max(0, product.accessory.stock)
                    product.accessory.save
    
                return Response({"message": "Produto adicionado ao carrinho!"}, status=status.HTTP_201_CREATED)
    
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
        return Response({"error": "Parâmetro product_id é obrigatório para adicionar itens."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        if item_id:
            try:
                data = json.loads(request.body)
                quantity = int(data.get("quantity", 1))
                cart_item = get_object_or_404(CartItem, id=item_id)
                product = cart_item.product

                stock_available = None
                if cart_item.product.get_product_type() == 'Clothing' and cart_item.size:
                    stock_available = cart_item.size.stock + cart_item.quantity

                    if quantity > stock_available:
                        return Response(
                            {"error": f"Estoque insuficiente. Disponível: {stock_available}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    cart_item.size.stock = stock_available - quantity
                    if product.get_product_type() == 'Clothing' and cart_item.size:
                        cart_item.size.stock = cart_item.product.stock
                        cart_item.size.save()
                    cart_item.size.save()

                else:
                    stock_available = cart_item.product.get_stock() + cart_item.quantity

                    if quantity > stock_available:
                        return Response(
                            {"error": f"Estoque insuficiente. Disponível: {stock_available}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    cart_item.product.stock = stock_available - quantity
                    if product.get_product_type() == 'Vinil':
                        product.vinil.stock = cart_item.product.stock
                        product.vinil.save()
                    elif product.get_product_type() == 'CD':
                        product.cd.stock = cart_item.product.stock
                        product.cd.save()
                    elif product.get_product_type() == 'Accessory':
                        product.accessory.stock = cart_item.product.stock
                        product.accessory.save()
                    cart_item.product.save()

                cart_item.quantity = max(1, quantity) 
                cart_item.save()

                return Response({"message": "Quantidade atualizada com sucesso!"}, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Parâmetro item_id é obrigatório para atualizar itens."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if item_id:
            try:
                cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
                product = cart_item.product
    
                if product.get_product_type() == 'Clothing' and cart_item.size:
                    cart_item.size.stock += cart_item.quantity
                    cart_item.size.save()
                elif product.get_product_type() == 'Vinil':
                    product.vinil.stock += cart_item.quantity
                    product.vinil.save()
                elif product.get_product_type() == 'CD':
                    product.cd.stock += cart_item.quantity
                    product.cd.save()
                elif product.get_product_type() == 'Accessory':
                    product.accessory.stock += cart_item.quantity
                    product.accessory.save()
                else:
                    raise ValueError("Tipo de produto desconhecido ou inválido.")
    
                cart_item.delete()
    
                return Response({"message": "Item removido com sucesso!"}, status=status.HTTP_200_OK)
    
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
        return Response({"error": "Parâmetro item_id é obrigatório para remover itens."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"error": "Método não permitido."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'DELETE', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def company(request, company_id):
    if request.method == 'GET':
        company = get_object_or_404(Company, id=company_id)
        serializer = CompanySerializer(company, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'DELETE':
        if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
            raise PermissionDenied
        company = get_object_or_404(Company, id=company_id)
        company.delete()
        return JsonResponse({'message': 'Company deleted successfully!'})
    elif request.method == 'PUT':
        if not (request.user.user_type == 'admin'):
            raise PermissionDenied
        company = get_object_or_404(Company, id=company_id)
        user = get_object_or_404(User, company=company)
        user.banned = True
        company.delete()
        return JsonResponse({'message': 'Company deleted successfully!'})


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def favorites(request, category):
    user = request.user
    if category == 'products':
        favorites = Favorite.objects.filter(user=user)
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    elif category == 'artists':
        favorites = FavoriteArtist.objects.filter(user=user)
        serializer = FavoriteArtistSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    elif category == 'company':
        favorites = FavoriteCompany.objects.filter(user=user)
        serializer = FavoriteCompanySerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    return Response({'error': 'Invalid category'}, status=400)


@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def product_favorites(request, product_id):
    if request.method == 'GET':
        product = get_object_or_404(Product, id=product_id)
        favorited = Favorite.objects.filter(user=request.user, product=product).exists()
        return JsonResponse({'favorited': favorited})
    elif request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if created:
            return JsonResponse({'message': 'Product favorited successfully!'})
        return JsonResponse({'message': 'Product is already favorited.'})
    elif request.method == 'DELETE':
        product = get_object_or_404(Product, id=product_id)
        favorite = Favorite.objects.filter(user=request.user, product=product).first()
        if favorite:
            favorite.delete()
            return JsonResponse({'message': 'Product unfavorited successfully!'})
        return JsonResponse({'message': 'Product is not favorited.'})
    
@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def artist_favorites(request, artist_id):
    if request.method == 'GET':
        artist = get_object_or_404(Artist, id=artist_id)
        favorited = FavoriteArtist.objects.filter(user=request.user, artist=artist).exists()
        return JsonResponse({'favorited': favorited})
    elif request.method == 'POST':
        artist = get_object_or_404(Artist, id=artist_id)
        favorite, created = FavoriteArtist.objects.get_or_create(user=request.user, artist=artist)
        if created:
            return JsonResponse({'message': 'Artist favorited successfully!'})
        return JsonResponse({'message': 'Artist is already favorited.'})
    elif request.method == 'DELETE':
        artist = get_object_or_404(Artist, id=artist_id)
        favorite = FavoriteArtist.objects.filter(user=request.user, artist=artist).first()
        if favorite:
            favorite.delete()
            return JsonResponse({'message': 'Artist unfavorited successfully!'})
        return JsonResponse({'message': 'Artist is not favorited.'})
    
@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def company_favorites(request, company_id):
    if request.method == 'GET':
        company = get_object_or_404(Company, id=company_id)
        favorited = FavoriteCompany.objects.filter(user=request.user, company=company).exists()
        return JsonResponse({'favorited': favorited})
    elif request.method == 'POST':
        company = get_object_or_404(Company, id=company_id)
        favorite, created = FavoriteCompany.objects.get_or_create(user=request.user, company=company)
        if created:
            return JsonResponse({'message': 'Company favorited successfully!'})
        return JsonResponse({'message': 'Company is already favorited.'})
    elif request.method == 'DELETE':
        company = get_object_or_404(Company, id=company_id)
        favorite = FavoriteCompany.objects.filter(user=request.user, company=company).first()
        if favorite:
            favorite.delete()
            return JsonResponse({'message': 'Company unfavorited successfully!'})
        return JsonResponse({'message': 'Company is not favorited.'})

@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def viewCart(request):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
    except Cart.DoesNotExist:
        cart = Cart.objects.create(user=user)

    cart_items = CartItem.objects.filter(cart=cart)
    cart_total = sum(item.product.price * item.quantity for item in cart_items)

    context = {
        'cart_items': cart_items,
        'cart_total': cart_total,
    }
    return render(request, 'cart.html', context)
@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    if request.method == 'POST':
        try:
            quantity = int(request.POST.get('quantity', 1))
            cart_item = get_object_or_404(CartItem, id=item_id)

            cart_item.quantity = max(1, quantity) 
            cart_item.save()

            return redirect('viewCart')
        except Exception as e:
            messages.error(request, f"Erro ao atualizar o carrinho: {str(e)}")
            return redirect('viewCart')
    return redirect('viewCart')
@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.delete()

        if request.session.get('discount_applied', False):
            request.session['discount_applied'] = False
            request.session.pop('discount_value', None)
            messages.info(request, "O código de desconto foi removido porque o carrinho foi alterado.")

        messages.success(request, "Item removido do carrinho com sucesso.")

    except CartItem.DoesNotExist:
        raise Http404("CartItem does not exist")
    return redirect('cart')


@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        rating = int(request.POST.get('rating', 0))
        review_text = request.POST.get('review', '').strip()

        if not rating and not review_text:
            form.add_error('rating', "Por favor, forneça uma avaliação com estrelas ou escreva um texto.")
            return render(request, 'productDetails.html', {'product': product, 'form': form})

        # Substituir `None` por string vazia
        review_text = review_text if review_text else ""

        review = Review.objects.create(
            product=product,
            user=request.user,
            rating=rating if rating > 0 else None,
            text=review_text
        )
        review.save()

        return redirect('productDetails', identifier=product_id)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def checkfavorite(request, category):
    user = request.user
    if category == 'products':
        favorite_products = Favorite.objects.filter(user=user).select_related('product')
        products_list = [
            {
                'id': fav.product.id,
                'name': fav.product.name,
                'price': fav.product.price,
                'image': fav.product.image.url
            }
            for fav in favorite_products
        ]
        return render(request, "favorites.html", {"favorite_products": products_list})

    elif category == 'artists':
        favorite_artists = FavoriteArtist.objects.filter(user=user).select_related('artist')
        artists_list = [
            {
                'id': fav.artist.id,
                'name': fav.artist.name,
                'image': fav.artist.image.url
            }
            for fav in favorite_artists
        ]
        return render(request, "favorites.html", {"favorite_artists": artists_list})

    return JsonResponse({"success": False, "message": "Invalid category."}, status=400)


@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def remove_from_favorites(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        user = request.user
        Favorite.objects.filter(user=user, product=product).delete()
        return redirect('favorites')

    except Product.DoesNotExist:
        return JsonResponse({"success": False, "message": "Product not found."}, status=404)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def remove_from_favorites_artist(request, artist_id):
    try:
        artist = get_object_or_404(Artist, id=artist_id)
        user = request.user
        FavoriteArtist.objects.filter(user=user, artist=artist).delete()
        return redirect('favorites')

    except Artist.DoesNotExist:
        return JsonResponse({"success": False, "message": "Artist not found."}, status=404)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def remove_from_favorites_company(request, company_id):
    try:
        company = get_object_or_404(Company, id=company_id)
        user = request.user
        FavoriteCompany.objects.filter(user=user, company=company).delete()
        return redirect('favorites')

    except Company.DoesNotExist:
        return JsonResponse({"success": False, "message": "Company not found."}, status=404)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def apply_discount(request):
    discount_code = request.query_params.get('discount_code', '').strip().lower()

    user = request.user

    if not discount_code:
        return Response({"success": False, "message": "Código de desconto não fornecido."}, status=status.HTTP_400_BAD_REQUEST)

    if discount_code == 'primeiracompra':
        if not Purchase.objects.filter(user=user).exists():
            return Response(
                {"success": True, "discount_value": 10.0, "message": "Código de desconto válido!"},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"success": False, "message": "O código de desconto só é válido para a primeira compra."},
                status=status.HTTP_400_BAD_REQUEST
            )

    return Response({"success": False, "message": "Código de desconto inválido."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def process_payment(request):
    user = request.user

    print(f"User: {user}")

    try:
        cart = Cart.objects.get(user=user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({"error": "O carrinho está vazio."}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Cart items: {cart_items}")

        payment_method = request.data.get('payment_method')
        shipping_address = request.data.get('shipping_address')
        discount_applied = request.data.get('discountApplied', False)

        if not payment_method or not shipping_address:
            raise ValidationError("Por favor, preencha todos os campos obrigatórios.")

        total = cart.total
        discount_value = request.data.get('discountValue', 0) if discount_applied else 0
        total -= discount_value

        shipping_cost = calculate_shipping_cost(cart)
        final_total = total + shipping_cost


        final_total2 = Decimal(str(final_total)).quantize(Decimal('0.01'))
        user_balance2 = Decimal(str(user.balance)).quantize(Decimal('0.01'))

        if user_balance2 < final_total2:
            return Response({
                "error": "Saldo insuficiente para processar o pagamento.",
                "balance": str(user.balance),  # Enviar o saldo atual do usuário
                "needed_amount": str(final_total)  # Enviar o valor necessário
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():


            user.balance -= Decimal(final_total)
            user.number_of_purchases += 1
            user.save()


            print(f"User balance after purchase: {user.balance}")
            purchase_data = {
                "user": user.id,
                "date": now().date(),
                "paymentMethod": payment_method,
                "shippingAddress": shipping_address,
                "total_amount": final_total,
                "status": "Em processamento",
                "discount_applied": discount_applied,
                "discount_value": discount_value,
            }

            purchase_serializer = PurchaseSerializer(data=purchase_data)
            purchase_serializer.is_valid(raise_exception=True)
            purchase = purchase_serializer.save()

            for item in cart_items:
                purchase_product_data = {
                    "purchase": purchase.id,
                    "product": item.product.id,
                    "quantity": item.quantity,
                    "total": item.quantity * item.product.price,
                }
                purchase_product_serializer = PurchaseProductSerializer(data=purchase_product_data)
                purchase_product_serializer.is_valid(raise_exception=True)
                purchase_product_serializer.save()

            cart_items.delete()

        return Response(
            {"message": "Pagamento processado com sucesso!", "purchase": purchase_serializer.data, "new_balance": user.balance},
            status=status.HTTP_201_CREATED,
        )

    except Cart.DoesNotExist:
        return Response({"error": "Carrinho não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        return Response({"error": "Erro interno do servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def calculate_shipping_cost(cart):
    if cart.user.country == 'Portugal':
        if cart.total < 100:
            return 5
        else:
            return 0
    else:
        if cart.total < 100:
            return 7.99
        else:
            return 0


@api_view(['GET'])
def company_home(request):
    company_id = request.user.company.id if request.user.user_type == 'company' else None
    return render(request, 'company_home.html', {'company_id': company_id})



@api_view(['GET'])
def company_products(request, company_id):
    company = get_object_or_404(Company, id=company_id)

    products = Product.objects.filter(company=company).annotate(
        favorites_count=Count('favorites'),
        reviews_count=Count('reviews')
    )

    products_data = ProductSerializer(products, many=True, context={'request': request}).data

    # Adiciona os valores de favoritos e reviews manualmente
    for product, serialized_product in zip(products, products_data):
        serialized_product['favorites_count'] = product.favorites_count
        serialized_product['reviews_count'] = product.reviews_count

    # Monta a resposta final
    response = {
        'company': {
            'id': company.id,
            'name': company.name,
            'logo': request.build_absolute_uri(company.logo.url) if company.logo else None,
        },
        'products': products_data,
    }

    return Response(response)



@api_view(['GET'])
def company_product_detail(request, company_id, product_id):
    company = get_object_or_404(Company, id=company_id)
    product = get_object_or_404(Product, id=product_id, company=company)

    product.favorites_count = product.favorites.count()
    reviews = product.reviews.all()


    if hasattr(product, 'clothing'):  
        sizes = product.clothing.sizes.all()
        product.size_stock = {
            'XS': sizes.filter(size='XS').first().stock if sizes.filter(size='XS').exists() else 0,
            'S': sizes.filter(size='S').first().stock if sizes.filter(size='S').exists() else 0,
            'M': sizes.filter(size='M').first().stock if sizes.filter(size='M').exists() else 0,
            'L': sizes.filter(size='L').first().stock if sizes.filter(size='L').exists() else 0,
            'XL': sizes.filter(size='XL').first().stock if sizes.filter(size='XL').exists() else 0,
        }
    else:
        product.size_stock = product.get_stock()

    return render(request, 'company_product_detail.html', {
        'company': company,
        'product': product,
        'reviews': reviews,
    })


@api_view(['PUT'])
def edit_product(request, product_id):
    if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
        raise PermissionDenied
    if (request.user.user_type == 'company' and request.user.company != Product.objects.get(id=product_id).company):
        raise PermissionDenied("Você não tem permissão para editar este produto.")
    product = get_object_or_404(Product, id=product_id)

    initial_product_type = product.get_product_type().lower()

    if request.method == 'POST':
        product_form = ProductForm(request.POST, request.FILES, instance=product)

        if product_form.is_valid():
            product = product_form.save(commit=False)

            price = product_form.cleaned_data.get('price')
            if price is None:
                return render(request, 'edit_product.html', {
                    'product_form': product_form,
                    'error_message': "Price is required.",
                    'initial_product_type': initial_product_type,
                })
            product.price = price

            product_type = product_form.cleaned_data['product_type'].lower()

            try:
                product.save()
            except IntegrityError:
                return render(request, 'edit_product.html', {
                    'product_form': product_form,
                    'error_message': "There was an error saving the product. Please try again.",
                    'initial_product_type': initial_product_type,
                })

            if product_type == 'vinil':
                vinil = getattr(product, 'vinil', None)
                if vinil:
                    vinil.name = product.name
                    vinil.price = product.price
                    vinil.save()

            elif product_type == 'cd':
                cd = getattr(product, 'cd', None)
                if cd:
                    cd.name = product.name
                    cd.price = product.price
                    cd.save()

            elif product_type == 'clothing':
                clothing = getattr(product, 'clothing', None)
                if clothing:
                    clothing.name = product.name
                    clothing.price = product.price
                    clothing.save()

            elif product_type == 'accessory':
                accessory = getattr(product, 'accessory', None)
                if accessory:
                    accessory.name = product.name
                    accessory.price = product.price
                    accessory.save()

            return Response({"success": True})



@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serialized_users = UserSerializer(users, many=True)
    return Response(serialized_users.data)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return redirect('admin_home')

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_product_delete(request, product_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return redirect('admin_home')

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):

    review = get_object_or_404(Review, id=review_id)
    product = review.product
    company = product.company

    if request.user.user_type == 'admin' or (request.user.user_type == 'company' and request.user.company == company):
        review.delete()
        return Response({"message": "Avaliação removida com sucesso."}, status=status.HTTP_204_NO_CONTENT)
    else:
        raise PermissionDenied("Apenas administradores ou o proprietário da companhia podem remover avaliações.")

@api_view(['GET'])
def get_filters(request):
    try:
        vinil_genres = Vinil.objects.values_list('genre', flat=True).distinct()
        cd_genres = CD.objects.values_list('genre', flat=True).distinct()
        genres = set(vinil_genres).union(cd_genres) 


        clothing_colors = Clothing.objects.values_list('color', flat=True).distinct()
        accessory_colors = Accessory.objects.values_list('color', flat=True).distinct()
        colors = set(clothing_colors).union(accessory_colors) 

        sizes = Size.objects.values_list('size', flat=True).distinct()

        materials = Accessory.objects.values_list('material', flat=True).distinct()

        is_on_promotion = Product.objects.values_list('is_on_promotion', flat=True).distinct()

        filters = {
            'genres': list(genres),
            'colors': list(colors),
            'sizes': list(sizes),
            'materials': list(materials),
            'is_on_promotion': list(is_on_promotion),
        }

        return Response(filters)

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
        }, status=500)


@api_view(['GET', 'POST'])
def reviews(request, product_id):
    if request.method == 'GET':
        product = get_object_or_404(Product, id=product_id)
        reviews = product.reviews.all()
        serialized_reviews = ReviewSerializer(reviews, many=True)
        return Response(serialized_reviews.data)
    
    elif request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)

        if not request.user.is_authenticated:
            return Response({"status": "error", "message": "Authentication required"}, status=401)

        user = request.user

        review_form = ReviewForm(request.data)
        if review_form.is_valid():
            Review.objects.create(
                date=request.data.get('date'),
                text=request.data.get('text'),
                rating=request.data.get('rating'),
                product=product, 
                user=user         
            )
            return Response({"status": "success", "message": "Review added successfully"})
        
        print(f"Review form errors: {review_form.errors}")
        return Response({"status": "error", "message": review_form.errors}, status=400)
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return Response({"status": "error", "message": "Authentication required"}, status=401)

        # Retrieve and delete the review
        review_id = request.data.get('review_id')
        if not review_id:
            return Response({"status": "error", "message": "Review ID is required"}, status=400)

        review = get_object_or_404(Review, id=review_id, user=request.user)  # Ensure user owns the review
        review.delete()
        return Response({"status": "success"})

    return Response({"status": "error", "message": "Method not allowed"}, status=405)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_messages_company(request, company_id):
    if request.user.user_type != 'individual':
        return JsonResponse({'error': 'Only individual users can access chat messages.'}, status=403)

    company = get_object_or_404(Company, id=company_id)

    chat = Chat.objects.filter(user=request.user, company=company).first()

    if not chat:
        chat = Chat.objects.create(user=request.user, company=company)

    chat.last_user_timestamp = now()
    chat.save()
    messages = chat.messages.order_by('date').values(
        'id',
        'text',
        'date',
        'is_from_company',
        'sender__username'
    )

    return JsonResponse({'messages': list(messages)}, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_chat_messages_user(request, user_id):
    if request.user.user_type != 'company':
        return JsonResponse({'error': 'Only company users can access chat messages.'}, status=403)

    user = get_object_or_404(User, id=user_id, user_type='individual')

    chat = Chat.objects.filter(user=user, company=request.user.company).first()
    
    if not chat:
        chat = Chat.objects.create(user=user, company=request.user.company)

    chat.last_company_timestamp = now()
    chat.save()

    messages = chat.messages.order_by('date').values(
        'id',
        'text',
        'date',
        'is_from_company',
        'sender__username'
    )

    return JsonResponse({'messages': list(messages)}, status=200)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_message(request, company_id=None, user_id=None):


    if request.user.user_type not in ['individual', 'company']:
        return JsonResponse({'error': 'Unauthorized user type.'}, status=403)

    data = loads(request.body.decode('utf-8'))
    message_text = data.get('text')

    if not message_text or not message_text.strip():
        return JsonResponse({'error': 'Message text cannot be empty.'}, status=400)

    if company_id and not user_id:
        if request.user.user_type != 'individual':
            return JsonResponse({'error': 'Only individual users can send messages to a company.'}, status=403)

        company = get_object_or_404(Company, id=company_id)

        chat, created = Chat.objects.get_or_create(user=request.user, company=company)

        is_from_company = False

    elif user_id and not company_id:
        if request.user.user_type != 'company':
            return JsonResponse({'error': 'Only company users can send messages to a user.'}, status=403)

        company = request.user.company
        if not company:
            return JsonResponse({'error': 'You are not associated with a company.'}, status=403)

        user = get_object_or_404(User, id=user_id, user_type='individual')

        chat = Chat.objects.filter(user=user, company=company).first()
        if not chat:
            return JsonResponse({'error': 'Chat not found for this user and company.'}, status=404)

        is_from_company = True

    else:
        return JsonResponse({'error': 'Invalid request. Provide either a company_id or user_id.'}, status=400)

    message = Message.objects.create(
        chat=chat,
        sender=request.user,
        is_from_company=is_from_company,
        text=message_text.strip()
    )
    

    return JsonResponse({
        'message': {
            'id': message.id,
            'text': message.text,
            'date': message.date,
            'is_from_company': message.is_from_company,
            'sender': message.sender.username,
        }
    }, status=201)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    user_data = UserSerializer(user).data
    return JsonResponse(user_data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_company(request):
    company_form = CompanyForm(request.data, request.FILES)
    user_form = UserForm(request.data)

    if company_form.is_valid() and user_form.is_valid():
        try:
            with transaction.atomic():
                company = company_form.save()

                user = user_form.save(commit=False)
                user.user_type = 'company'
                user.firstname = 'Company'
                user.lastname = company.name
                user.email = company.email
                user.phone = company.phone
                user.address = company.address
                user.company = company
                user.set_password(user_form.cleaned_data['password'])
                user.save()

                group = Group.objects.get(name='company')
                user.groups.add(group)

            return Response(
                {"message": "Company and associated user have been created successfully."},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": "An error occurred while creating the company and user.", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        errors = {
            "company_errors": company_form.errors,
            "user_errors": user_form.errors,
        }
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_chat(request):
    if request.user.user_type == 'individual':
        chats = Chat.objects.filter(user=request.user)
    elif request.user.user_type == 'company':
        company = request.user.company
        chats = Chat.objects.filter(company=company)
    else:
        return Response({"error": "Unauthorized user type."}, status=status.HTTP_403_FORBIDDEN)

    serialized_chats = ChatSerializer(chats, many=True)
    return Response(serialized_chats.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def fetch_product_stock(request, product_id):
    """
    Fetch stock for a specific product by ID.
    """
    product = get_object_or_404(Product, id=product_id)

    stock = None
    if product.get_product_type() == 'Vinil':
        stock = product.vinil.stock
    elif product.get_product_type() == 'CD':
        stock = product.cd.stock
    elif product.get_product_type() == 'Clothing':
        sizes = product.clothing.sizes.all().values("size", "stock")
        stock = {"total_stock": sum(size["stock"] for size in sizes), "sizes": list(sizes)}
    elif product.get_product_type() == 'Accessory':
        stock = product.accessory.stock

    return Response({"stock": stock})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_product_stock(request, product_id):
    """Update stock or sizes for a product."""
    try:
        product = Product.objects.get(id=product_id)
        product_type = product.get_product_type()

        # Ensure request data is properly structured
        if not isinstance(request.data, list):
            return Response({'error': 'Request data must be a list'}, status=status.HTTP_400_BAD_REQUEST)

        if product_type == 'Clothing':
            # Validate and update sizes for Clothing
            for size_data in request.data:
                if 'size' not in size_data or 'stock' not in size_data:
                    return Response({'error': 'Each size entry must include "size" and "stock"'}, status=status.HTTP_400_BAD_REQUEST)

                size_instance = product.clothing.sizes.filter(size=size_data['size']).first()
                if not size_instance:
                    return Response({'error': f"Size '{size_data['size']}' not found for the product"}, status=status.HTTP_404_NOT_FOUND)

                size_instance.stock = size_data['stock']
                size_instance.save()

            return Response({'message': 'Sizes updated successfully'}, status=status.HTTP_200_OK)

        else:
            # Update stock for specific product types
            if len(request.data) != 1 or 'stock' not in request.data[0]:
                return Response({'error': 'Request must contain a single object with "stock" for non-Clothing products'}, status=status.HTTP_400_BAD_REQUEST)

            stock_value = request.data[0]['stock']

            if product_type == 'Vinil':
                vinil = product.vinil
                vinil.stock = stock_value
                vinil.save()
            elif product_type == 'CD':
                cd = product.cd
                cd.stock = stock_value
                cd.save()
            elif product_type == 'Accessory':
                accessory = product.accessory
                accessory.stock = stock_value
                accessory.save()
            else:
                product.stock = stock_value
                product.save()

            return Response({'message': 'Stock updated successfully'}, status=status.HTTP_200_OK)

    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_unread_messages(request):
    if not request.user.is_authenticated or request.user.user_type not in ['company', 'individual']:
        raise PermissionDenied

    total_unread_messages = 0

    if hasattr(request.user, 'company') and request.user.company:
        chats = Chat.objects.filter(company=request.user.company)

        for chat in chats:
            unread_messages = chat.messages.filter(
                date__gt=chat.last_company_timestamp,
                is_from_company=False
            ).count()
            total_unread_messages += unread_messages

    elif request.user.user_type == 'individual':
        chats = Chat.objects.filter(user=request.user)

        for chat in chats:
            unread_messages = chat.messages.filter(
                date__gt=chat.last_user_timestamp,
                is_from_company=True
            ).count()
            total_unread_messages += unread_messages
    return JsonResponse({'total_unread_messages': total_unread_messages})

@api_view(['GET'])
def get_chats_user(request, company_id=None, user_id=None):

    user = get_object_or_404(User, id=user_id, user_type='individual')
    chats = Chat.objects.filter(user=user)
    chats = ChatSerializer(chats, many=True, context={'request': request}).data
    return JsonResponse({"chats": chats})
    

@api_view(['GET'])
def get_chats_company(request, company_id=None):
    company = get_object_or_404(Company, id=company_id)
    chats = Chat.objects.filter(company=company)
    chats = ChatSerializer(chats, many=True, context={'request': request}).data
    return JsonResponse({"chats": chats})


#Fiz esta só para não ter que retornar as informações todas
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_number_unread_messages(request):
    user = request.user
    if user.user_type == 'company':
        chats = Chat.objects.filter(company=user.company)
        unread_count = 0
        for chat in chats:
            unread_count += chat.messages.filter(is_from_company=False, date__gt=chat.last_company_timestamp).count()
    elif user.user_type == 'individual':
        chats = Chat.objects.filter(user=user)
        unread_count = 0
        for chat in chats:
            unread_count += chat.messages.filter(is_from_company=True, date__gt=chat.last_user_timestamp).count()
    return JsonResponse({'unread_count': unread_count})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_image(request, user_id):
    user = get_object_or_404(User, id=user_id)
    image = request.build_absolute_uri(user.image.url) if user.image else None
    return JsonResponse({'image_url': image})
