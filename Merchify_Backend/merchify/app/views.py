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
from django.db.models import Avg, Q
from django.http import JsonResponse, Http404
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse, resolve, Resolver404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import jwt
from rest_framework_simplejwt.tokens import RefreshToken

# Django Forms and Validation
from .forms import (
    ReviewForm, RegisterForm, ProductForm, CompanyForm, UserForm,
    VinilForm, CDForm, ClothingForm, AccessoryForm,
    UploadUserProfilePicture, UpdatePassword, UpdateProfile
)
from django.core.exceptions import PermissionDenied
from django.contrib.auth import password_validation

# Application Models
from app.models import (
    Product, Company, Cart, CartItem, Purchase, User, Vinil, CD, Clothing, Accessory,
    Size, Favorite, FavoriteArtist, FavoriteCompany, Artist, Review, PurchaseProduct
)

# Logging
logger = logging.getLogger(__name__)

# Rest Framework Imports
from rest_framework import status
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes
)
from app.serializers import CartItemSerializer, FavoriteArtistSerializer, FavoriteCompanySerializer, FavoriteSerializer, LoginSerializer, RegisterSerializer, UserSerializer, ProductSerializer, CompanySerializer, ArtistSerializer

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authtoken.models import Token

@api_view(['GET'])
def home(request):
    try:
        artists = Artist.objects.all()
        recent_products = Product.objects.order_by('-addedProduct')[:20]

        # Pass `request` in the serializer context
        artists_data = ArtistSerializer(artists, many=True, context={'request': request}).data
        recent_products_data = ProductSerializer(recent_products, many=True, context={'request': request}).data

        return Response({
            'artists': artists_data,
            'recent_products': recent_products_data,
        })
    except Exception as e:
        logger.error(f"Error in home view: {e}")
        return Response({'error': str(e)}, status=500)

#def home(request):
#    artists = Artist.objects.all()
#    recent_products = Product.objects.order_by('-addedProduct')[:20]
#
    #if request.session.get('clear_cart'):
    #    cart = Cart.objects.filter(user=request.user).first()
    #    if cart:
    #        cart.items.all().delete()
    #        cart.delete()
#
    #    del request.session['clear_cart']
#
    #user = request.user
    #show_promotion= False
    #if user.is_authenticated:
    #    if user.user_type == 'admin':
    #        return redirect('admin_home')
    #    elif user.user_type == 'company':
    #         return redirect('company_products',user.company.id)
    #    show_promotion= not Purchase.objects.filter(user=user).exists()
    #else:
    #    show_promotion= True
#
    #recently_viewed_ids = request.session.get('recently_viewed', [])
    #recently_viewed_products = Product.objects.filter(id__in=recently_viewed_ids)
    #recently_viewed_products = sorted(
    #    recently_viewed_products,
    #    key=lambda product: recently_viewed_ids.index(product.id)
    #)
#
    #most_viewed_products = Product.objects.order_by('-count')[:8]
         

    #return render(request, 'home.html', {'artists': artists, 'products': recent_products, 'show_promotion': show_promotion, 'recently_viewed_products': recently_viewed_products, 'most_viewed_products': most_viewed_products})

@api_view(['GET'])
def companhias(request):
    companies = Company.objects.all()

    # Fetch favorited companies for the authenticated user
    if request.user.is_authenticated:
        favorited_company_ids = FavoriteCompany.objects.filter(user=request.user).values_list('company_id', flat=True)
    else:
        favorited_company_ids = []

    # Serialize company data
    serializer = CompanySerializer(companies, many=True)
    companies_data = serializer.data

    # Add `is_favorited` and other custom fields
    for company in companies_data:
        company_id = company['id']
        company['is_favorited'] = company_id in favorited_company_ids

    return Response(companies_data)

@api_view(['GET'])
def produtos(request):
    produtos = Product.objects.all()

    # Sorting logic
    sort = request.GET.get('sort', 'featured')
    if sort == 'priceAsc':
        produtos = produtos.order_by('price')
    elif sort == 'priceDesc':
        produtos = produtos.order_by('-price')

    product_type = request.GET.get('type')
    if product_type:
        if product_type == 'Vinil':
            produtos = produtos.filter(vinil__isnull=False)
            genre = request.GET.get('genreVinyl')
            if genre:
                produtos = produtos.filter(vinil__genre=genre)

        elif product_type == 'CD':
            produtos = produtos.filter(cd__isnull=False)
            genre = request.GET.get('genreCD')
            if genre:
                produtos = produtos.filter(cd__genre=genre)

        elif product_type == 'Clothing':
            produtos = produtos.filter(clothing__isnull=False)
            color = request.GET.get('colorClothing')
            if color:
                produtos = produtos.filter(clothing__color=color)

        elif product_type == 'Accessory':
            produtos = produtos.filter(accessory__isnull=False)
            color = request.GET.get('colorAccessory')
            if color:
                produtos = produtos.filter(accessory__color=color)
            size = request.GET.get('size')
            if size:
                produtos = produtos.filter(accessory__size=size)

    # Filtering by price range
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        try:
            produtos = produtos.filter(price__gte=float(min_price))
        except ValueError:
            logger.debug("Invalid minimum price provided.")
    if max_price:
        try:
            produtos = produtos.filter(price__lte=float(max_price))
        except ValueError:
            logger.debug("Invalid maximum price provided.")

    # Serialize the filtered products
    serializer = ProductSerializer(produtos, many=True)
    return Response(serializer.data)

    #for product in produtos:
    #   product.is_favorited = product.id in favorited_product_ids

    #genres = Vinil.objects.values_list('genre', flat=True).distinct()
    #colors = Clothing.objects.values_list('color', flat=True).distinct()

    #return render(request, 'products.html', {'produtos': produtos, 'genres': genres, 'colors': colors })

@api_view(['GET'])
def artistas(request):
    artists = Artist.objects.all()

    if request.user.is_authenticated:
        favorited_artist_ids = FavoriteArtist.objects.filter(user=request.user).values_list('artist_id', flat=True)
    else:
        favorited_artist_ids = []

    serializer = ArtistSerializer(artists, many=True, context={'request': request})
    artists_data = serializer.data

    # Add "is_favorited" field to each artist
    for artist_data in artists_data:
        artist_data['is_favorited'] = int(artist_data['id']) in favorited_artist_ids

    return Response(artists_data)

#@api_view(['GET'])
#def artistsProducts(request, name):
#    artist = get_object_or_404(Artist, name=name)
#
#    products = Product.objects.filter(artist=artist)
#    print(products)
#    
#    sort = request.GET.get('sort', 'featured')
#    if sort == 'priceAsc':
#        products = products.order_by('price')
#    elif sort == 'priceDesc':
#        products = products.order_by('-price')
#
#    if request.user.is_authenticated:
#        favorited_product_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
#    else:
#        favorited_product_ids = []
#
#    for product in products:
#        product.is_favorited = product.id in favorited_product_ids
#
#
#    background_url = artist.background_image.url
#
#    product_type = request.GET.get('type')
#    if product_type:
#        if product_type == 'Vinil':
#            products = products.filter(vinil__isnull=False)
#            genre = request.GET.get('genreVinyl')
#            if genre:
#                products = products.filter(vinil__genre=genre)
#            logger.debug(f"Filtered by 'Vinil' type and genre {genre}, products count: {products.count()}")
#
#        elif product_type == 'CD':
#            products = products.filter(cd__isnull=False)
#            genre = request.GET.get('genreCD')
#            if genre:
#                products = products.filter(cd__genre=genre)
#            logger.debug(f"Filtered by 'CD' type and genre {genre}, products count: {products.count()}")
#
#        elif product_type == 'Clothing':
#            products = products.filter(clothing__isnull=False)
#            color = request.GET.get('colorClothing')
#            if color:
#                products = products.filter(clothing__color=color)
#            logger.debug(f"Filtered by 'Clothing' type and color {color}, products count: {products.count()}")
#
#        elif product_type == 'Accessory':
#            products = products.filter(accessory__isnull=False)
#            color = request.GET.get('colorAccessory')
#            if color:
#                products = products.filter(accessory__color=color)
#            size = request.GET.get('size')
#            if size:
#                products = products.filter(accessory__size=size)
#            logger.debug(f"Filtered by 'Accessory' type, color {color}, and size {size}, products count: {products.count()}")
#
#    min_price = request.GET.get('min_price')
#    max_price = request.GET.get('max_price')
#    if min_price:
#        try:
#            products = products.filter(price__gte=float(min_price))
#            logger.debug(f"Applied min price filter {min_price}, products count: {products.count()}")
#        except ValueError:
#            logger.debug("Invalid minimum price provided.")
#    if max_price:
#        try:
#            products = products.filter(price__lte=float(max_price))
#            logger.debug(f"Applied max price filter {max_price}, products count: {products.count()}")
#        except ValueError:
#            logger.debug("Invalid maximum price provided.")
#
#    genres = Vinil.objects.values_list('genre', flat=True).distinct()
#    colors = Clothing.objects.values_list('color', flat=True).distinct()
#
#    context = {
#        'artist': artist,
#        'products': products,
#        'background_url': background_url,
#        'genres': genres,
#        'colors': colors
#    }
#    return render(request, 'artists_products.html', context)

@api_view(['GET'])
def artistsProducts(request, name):
    try:
        artist = get_object_or_404(Artist, name=name)
    except Exception as e:
        return JsonResponse({'error': 'Artista não encontrado'}, status=404)

    try:
        products = Product.objects.filter(artist=artist)

        # Determine favorite products for authenticated users
        if request.user.is_authenticated:
            favorited_product_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
        else:
            favorited_product_ids = []

        # Serialize products
        serializer_context = {'request': request}
        product_serializer = ProductSerializer(products, many=True, context=serializer_context)
        products_data = product_serializer.data

        # Add "is_favorited" field to serialized product data
        for product_data in products_data:
            product_data['is_favorited'] = product_data['id'] in favorited_product_ids

        # Additional data
        genres = list(Vinil.objects.values_list('genre', flat=True).distinct())
        colors = list(Clothing.objects.values_list('color', flat=True).distinct())

        # Serialize artist
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


#@api_view(['GET'])
#def productDetails(request, identifier):
#    product = get_object_or_404(Product, id=identifier)
#    product.count += 1
#    product.save()
#
#    recently_viewed = request.session.get('recently_viewed', [])
#    if product.id in recently_viewed:
#        recently_viewed.remove(product.id)
#    recently_viewed.insert(0, product.id)
#    recently_viewed = recently_viewed[:4]
#    request.session['recently_viewed'] = recently_viewed
#
#    context = {
#        'product': product,
#    }
#
#    if isinstance(product, Clothing):
#        sizes = product.sizes.all()
#        context['sizes'] = sizes
#
#    average_rating = product.reviews.aggregate(Avg('rating'))['rating__avg'] or 0
#    context['average_rating'] = average_rating
#
#    user = request.user
#    return render(request, 'productDetails.html', context)


@api_view(['GET', 'DELETE', 'PUT'])
def productDetails(request, identifier):
    if request.method == 'GET':
        product = get_object_or_404(Product, id=identifier)
        product.count += 1
        product.save()

        # Base product data
        product_data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'image': product.image.url if product.image else None,
            'artist': {'name': product.artist.name} if product.artist else None,
            'company': {'name': product.company.name} if product.company else None,
            'category': product.category,
            'addedProduct': product.addedProduct.strftime('%Y-%m-%d') if product.addedProduct else None,
            'count': product.count,
            'average_rating': product.get_average_rating(),
            'product_type': product.get_product_type(),
            'stock': product.get_stock(),
        }

        # Add clothing-specific data if applicable
        if hasattr(product, 'clothing'):
            product_data['sizes'] = [
                {'id': size.id, 'size': size.size, 'stock': size.stock}
                for size in product.clothing.sizes.all()
            ]

        # Add vinil-specific data if applicable
        if hasattr(product, 'vinil'):
            product_data['vinil'] = {
                'genre': product.vinil.genre,
                'lpSize': product.vinil.lpSize,
                'releaseDate': product.vinil.releaseDate.strftime('%Y-%m-%d') if product.vinil.releaseDate else None,
                'stock': product.vinil.stock,
            }

        # Add CD-specific data if applicable
        if hasattr(product, 'cd'):
            product_data['cd'] = {
                'genre': product.cd.genre,
                'releaseDate': product.cd.releaseDate.strftime('%Y-%m-%d') if product.cd.releaseDate else None,
                'stock': product.cd.stock,
            }

        # Add accessory-specific data if applicable
        if hasattr(product, 'accessory'):
            product_data['accessory'] = {
                'material': product.accessory.material,
                'color': product.accessory.color,
                'size': product.accessory.size,
                'stock': product.accessory.stock,
            }

        # Add reviews
        product_data['reviews'] = [
            {
                'user': {'username': review.user.username},
                'rating': review.rating,
                'text': review.text,
                'date': review.date.strftime('%Y-%m-%d') if review.date else None,
            }
            for review in product.reviews.all()
        ]

        return JsonResponse(product_data, safe=False)
    elif request.method == 'DELETE':
        if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
            print("User is not admin or company")
            raise PermissionDenied
        product = get_object_or_404(Product, id=identifier)
        product.delete()
        return JsonResponse({'message': 'Produto excluído com sucesso!'})




@api_view(['GET'])
def search(request):
    query = request.GET.get('search', '').strip()

    if query:
        products = Product.objects.filter(Q(name__icontains=query) | Q(artist__name__icontains=query)).exclude(name__isnull=True).exclude(name='')
        artists = Artist.objects.filter(name__icontains=query).exclude(name__isnull=True).exclude(name='')
    else:
        products = Product.objects.none()
        artists = Artist.objects.none()

    if request.user.is_authenticated:
        favorited_artist_ids = FavoriteArtist.objects.filter(user=request.user).values_list('artist_id', flat=True)
        favorited_product_ids = Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
    else:
        favorited_artist_ids = []
        favorited_product_ids = []

    artist_results = [
        {
            'id': artist.id,
            'name': artist.name,
            'is_favorited': artist.id in favorited_artist_ids,
            'image': artist.image.url if artist.image else None
        }
        for artist in artists
    ]

    product_results = [
        {
            'id': product.id,
            'name': product.name,
            'artist_name': product.artist.name if product.artist else None,
            'is_favorited': product.id in favorited_product_ids,
            'image': product.image.url if product.image else None
        }
        for product in products
    ]
    return Response({
        'products': product_results,
        'artists': artist_results,
        'query': query,
    })

@api_view(['POST'])
def register_view(request):
   serializer = RegisterSerializer(data=request.data)
   if serializer.is_valid():
       user = serializer.save()
       refresh = RefreshToken.for_user(user)
       return Response({
           'message': 'User registered successfully!',
           'access': str(refresh.access_token),
           'refresh': str(refresh),
           'username': user.username,
           'id': user.id,
       }, status=status.HTTP_201_CREATED)
   print(serializer.errors)
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def ban_user(request, user_id):
    print(request.headers.get('Authorization'))  # Ensure the token is received
    print(request.user)  # Check the authenticated user

    user = get_object_or_404(User, id=user_id)
    user.is_banned = True
    user.save()
    return JsonResponse({'message': 'User banned successfully!'})


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'username': user.username,
                'id': user.id,
                'user_type': user.user_type,
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def validate_token(request):
    token = request.data.get('token')
    if not token:
        return Response({"error": "Token is required"}, status=400)

    try:
        # Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        
        # Fetch the user from the database
        user = User.objects.get(id=payload['user_id'])
        
        # Return user data
        return Response({
            "id": user.id,
            "username": user.username,
            "user_type": user.user_type,
            "number_of_purchases": user.number_of_purchases
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

#@api_view(['POST'])
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
#def add_to_cart(request, product_id):
#    if request.method == "POST":
#        try:
#            if not isinstance(request.user, User):
#                return JsonResponse({"error": "User is not authenticated."}, status=400)
#            
#            data = json.loads(request.body)
#            quantity = int(data.get("quantity", 1))
#            size_id = data.get("size") 
#
#            product = get_object_or_404(Product, id=product_id)
#            
#            size = None
#            if product.get_product_type() == 'Clothing':
#                if not size_id:
#                    return JsonResponse({"error": "Size is required for clothing items."}, status=400)
#                size = get_object_or_404(Size, id=size_id)
#            
#            cart, created = Cart.objects.get_or_create(user=request.user, defaults={"date": date.today()})
#            
#            cart_item, item_created = CartItem.objects.get_or_create(
#                cart=cart, 
#                product=product, 
#                size=size,  
#                defaults={"quantity": quantity}
#            )
#
#            if not item_created:
#                cart_item.quantity += quantity
#                cart_item.save()
#
#            return JsonResponse({"message": "Produto adicionado ao carrinho!"})
#
#        except json.JSONDecodeError:
#            return JsonResponse({"error": "Invalid JSON data"}, status=400)
#
#    return JsonResponse({"error": "Invalid request"}, status=400)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def manage_cart(request, user_id=None, product_id=None, item_id=None):
    """
    View Geral para Gerenciamento de Carrinho:
    - GET: Obter todos os itens do carrinho do usuário
    - POST: Adicionar item ao carrinho
    - PUT: Atualizar quantidade de um item no carrinho
    - DELETE: Remover um item do carrinho
    """
    print("olaaaaa")
    print("aqqui")
    print(user_id)
    print(product_id)
    print(item_id)
    print(request.user.id)

    if not user_id or user_id != request.user.id:
        print("aquiiiiiiiiiiiiiiiiiiiii")
        return Response({"error": "Acesso não autorizado."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        print("aqui")
        try:
            cart = Cart.objects.get(user_id=user_id)
            cart_items = CartItem.objects.filter(cart=cart)
            serializer = CartItemSerializer(cart_items, many=True)
            return Response({"cart_items": serializer.data}, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            return Response({"error": "Carrinho não encontrado."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        print("aqui no adicionar")
        # Adicionar um item ao carrinho
        if product_id:
            print("aqui no adicionar")
            try:
                data = json.loads(request.body)
                quantity = int(data.get("quantity", 1))
                size_id = data.get("size")
                product = get_object_or_404(Product, id=product_id)

                size = None
                if product.get_product_type() == 'Clothing' and size_id:
                    size = get_object_or_404(Size, id=size_id)

                cart, created = Cart.objects.get_or_create(user_id=user_id)
                cart_item, item_created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    size=size,
                    defaults={"quantity": quantity}
                )

                if not item_created:
                    cart_item.quantity += quantity
                    cart_item.save()

                return Response({"message": "Produto adicionado ao carrinho!"}, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Parâmetro product_id é obrigatório para adicionar itens."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        # Atualizar um item do carrinho
        if item_id:
            try:
                data = json.loads(request.body)
                quantity = int(data.get("quantity", 1))
                cart_item = get_object_or_404(CartItem, id=item_id)

                cart_item.quantity = max(1, quantity)
                cart_item.save()

                return Response({"message": "Quantidade atualizada com sucesso!"}, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Parâmetro item_id é obrigatório para atualizar itens."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Remover um item do carrinho
        if item_id:
            try:
                cart_item = get_object_or_404(CartItem, id=item_id)
                cart_item.delete()

                return Response({"message": "Item removido com sucesso!"}, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Parâmetro item_id é obrigatório para remover itens."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"error": "Método não permitido."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def company(request, company_id):
    if request.method == 'GET':
        company = get_object_or_404(Company, id=company_id)
        serializer = CompanySerializer(company)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
            raise PermissionDenied
        company = get_object_or_404(Company, id=company_id)
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
        serializer = FavoriteCompanySerializer(favorites, many=True)
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

#@api_view(['POST'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def viewCart(request):
#    user = request.user
#    try:
#        cart = Cart.objects.get(user=user)
#    except Cart.DoesNotExist:
#        cart = Cart.objects.create(user=user)
#
#    cart_items = CartItem.objects.filter(cart=cart)
#    cart_total = sum(item.product.price * item.quantity for item in cart_items)
#
#    context = {
#        'cart_items': cart_items,
#        'cart_total': cart_total,
#    }
#    return render(request, 'cart.html', context)


#@api_view(['POST'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def update_cart_item(request, item_id):
#    if request.method == 'POST':
#        try:
#            quantity = int(request.POST.get('quantity', 1))
#            cart_item = get_object_or_404(CartItem, id=item_id)
#
#            cart_item.quantity = max(1, quantity) 
#            cart_item.save()
#
#            return redirect('viewCart')
#        except Exception as e:
#            messages.error(request, f"Erro ao atualizar o carrinho: {str(e)}")
#            return redirect('viewCart')
#    return redirect('viewCart')

#@api_view(['POST'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def remove_from_cart(request, product_id):
#    try:
#        cart = Cart.objects.get(user=request.user)
#        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
#        cart_item.delete()
#
#        if request.session.get('discount_applied', False):
#            request.session['discount_applied'] = False
#            request.session.pop('discount_value', None)
#            messages.info(request, "O código de desconto foi removido porque o carrinho foi alterado.")
#
#        messages.success(request, "Item removido do carrinho com sucesso.")
#
#    except CartItem.DoesNotExist:
#        raise Http404("CartItem does not exist")
#    return redirect('cart')


@login_required(login_url='/login')
def profile(request):
    user = request.user

    if request.method == 'GET':
        logger.debug("Método GET acionado, carregando formulário.")
        image_form = UploadUserProfilePicture()
        profile_form = UpdateProfile(initial={
            'name': user.first_name,
            'surname': user.last_name,
            'email': user.email,
            'username': user.username,
            'address': user.address,
            'phone': user.phone,
            'country': user.country
        })
        password_form = UpdatePassword()
        
        purchases = Purchase.objects.filter(user=user) if user.purchases.exists() else []
        
        for purchase in purchases:
            if purchase.total_amount > 100:
                purchase.shipping_fee = 0
            else:
                purchase.shipping_fee = 4.99 if user.country.lower() == "portugal" else 6.0

        

        return render(request, 'profile.html', {
            'user': user,
            'image_form': image_form,
            'profile_form': profile_form,
            'password_form': password_form,
            'number_of_purchases': len(purchases),
            'purchases': purchases,
        })

    elif request.method == 'POST':
        if 'save' in request.POST:
            logger.debug("Salvando alterações no perfil do usuário.")
            user.first_name = request.POST.get('name', user.first_name)
            user.last_name = request.POST.get('surname', user.last_name)
            user.email = request.POST.get('email', user.email)
            user.username = request.POST.get('username', user.username)
            user.address = request.POST.get('address', user.address)
            phone = request.POST.get('phone', user.phone)
            user.country = request.POST.get('country', user.country)

            if not re.fullmatch(r'\d{9}', phone):
                messages.error(request, 'O número de telefone deve conter exatamente 9 dígitos.')
                profile_form = UpdateProfile(initial={
                    'name': user.first_name,
                    'surname': user.last_name,
                    'email': user.email,
                    'username': user.username,
                    'address': user.address,
                    'phone': phone, 
                    'country': user.country
                })
                image_form = UploadUserProfilePicture()
                password_form = UpdatePassword()
                purchases = Purchase.objects.filter(user=user)
                return render(request, 'profile.html', {
                    'user': user,
                    'image_form': image_form,
                    'profile_form': profile_form,
                    'password_form': password_form,
                    'number_of_purchases': purchases.count(),
                    'purchases': purchases,
                })
            else:
                user.phone = phone
            
            if 'image' in request.FILES:
                logger.debug("Imagem de perfil recebida.")
                user.image = request.FILES['image']

            user.save()
            messages.success(request, 'Perfil atualizado com sucesso!')
            return redirect('/account/profile')

        elif 'delete_account' in request.POST:
            logger.debug("Solicitação para eliminar a conta recebida.")
            user.delete()
            return redirect('home')

        elif 'submit_password' in request.POST:
            logger.debug("Solicitação para mudar a senha recebida.")
            old_password = request.POST.get('old_password')
            new_password = request.POST.get('new_password')
            confirm_new_password = request.POST.get('confirm_new_password')
        
            if not old_password or not new_password or not confirm_new_password:
                logger.warning("Campos de senha não preenchidos.")
                messages.error(request, 'Todos os campos de senha são obrigatórios.')
            else:
                if user.check_password(old_password):
                    logger.debug("Senha antiga correta.")
                    if new_password == confirm_new_password:
                        logger.debug("Novas senhas coincidem.")
                        try:
                            password_validation.validate_password(new_password, user)
                            logger.debug("Nova senha válida.")
                            user.set_password(new_password)
                            user.save()
                            messages.success(request, 'Senha alterada com sucesso!')
                            return redirect('/account/profile')
                        except ValidationError as e:
                            logger.error("Erro de validação de senha: %s", e)
                            for error in e.messages:
                                messages.error(request, error)
                    else:
                        logger.warning("As novas senhas não coincidem.")
                        messages.error(request, 'As senhas não coincidem!')
                else:
                    logger.warning("Senha antiga incorreta.")
                    messages.error(request, 'Senha antiga incorreta!')

    logger.debug("Carregando informações do usuário para a renderização.")
    purchases = Purchase.objects.filter(user=user)
    return render(request, 'profile.html', {
        'user': user,
        'number_of_purchases': purchases.count(),
        'purchases': purchases,
    })


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


#@api_view(['POST'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def checkfavorite(request, category):
#    user = request.user
#    if category == 'products':
#        favorite_products = Favorite.objects.filter(user=user).select_related('product')
#        products_list = [
#            {
#                'id': fav.product.id,
#                'name': fav.product.name,
#                'price': fav.product.price,
#                'image': fav.product.image.url
#            }
#            for fav in favorite_products
#        ]
#        return render(request, "favorites.html", {"favorite_products": products_list})
#
#    elif category == 'artists':
#        favorite_artists = FavoriteArtist.objects.filter(user=user).select_related('artist')
#        artists_list = [
#            {
#                'id': fav.artist.id,
#                'name': fav.artist.name,
#                'image': fav.artist.image.url
#            }
#            for fav in favorite_artists
#        ]
#        return render(request, "favorites.html", {"favorite_artists": artists_list})
#
#    return JsonResponse({"success": False, "message": "Invalid category."}, status=400)
#
#@login_required
#def checkfavoriteOld(request):
#    user = request.user
#
#    favorite_products = Favorite.objects.filter(user=user, product__isnull=False).select_related('product')
#    products_list = [
#        {
#            'id': fav.product.id,
#            'name': fav.product.name,
#            'price': fav.product.price,
#            'image': fav.product.image.url
#        }
#        for fav in favorite_products if fav.product  
#    ]
#
#    favorite_artists = FavoriteArtist.objects.filter(user=user, artist__isnull=False).select_related('artist')
#    artists_list = [
#        {
#            'id': fav.artist.id,
#            'name': fav.artist.name,
#            'image': fav.artist.image.url
#        }
#        for fav in favorite_artists if fav.artist  
#    ]
#
#    favorite_companies = FavoriteCompany.objects.filter(user=user, company__isnull=False).select_related('company')
#    companies_list = [
#        {
#            'id': fav.company.id,
#            'name': fav.company.name,
#            'image': fav.company.logo.url
#        }
#        for fav in favorite_companies if fav.company  
#    ]
#
#
#    category = request.GET.get('category', 'products')
#    return render(request, 'favorites.html', {
#        'category': category,
#        'favorite_products': products_list,
#        'favorite_artists': artists_list,
#        'favorite_companies': companies_list
#    })
#
#
#@require_POST
#@login_required(login_url='/login/')
#def addtofavorite(request, product_id):
#    try:
#        product = get_object_or_404(Product, id=product_id)
#        user = request.user
#
#        favorite, created = Favorite.objects.get_or_create(user=user, product=product)
#        favorited = created
#
#        if not created:
#            favorite.delete()
#
#        return JsonResponse({"success": True, "favorited": favorited})
#
#    except Product.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Product not found."}, status=404)
#
#@require_POST
#@login_required(login_url='/login/')
#def addtofavoriteartist(request, artist_id):
#    try:
#        artist = get_object_or_404(Artist, id=artist_id)
#        user = request.user
#
#        if not artist:
#            return JsonResponse({"success": False, "message": "Invalid artist."}, status=400)
#
#        favorite_artist, created = FavoriteArtist.objects.get_or_create(user=user, artist=artist)
#        favorited = created
#
#        if not created:
#            favorite_artist.delete()
#
#        return JsonResponse({"success": True, "favorited": favorited})
#
#    except Artist.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Artist not found."}, status=404)
#    except Exception as e:
#        return JsonResponse({"success": False, "message": str(e)}, status=500)
#
#@require_POST
#@login_required(login_url='/login/')
#def addtofavoritecompany(request, company_id):
#    try:
#        company = get_object_or_404(Company, id=company_id)
#        user = request.user
#
#        if not company:
#            return JsonResponse({"success": False, "message": "Invalid artist."}, status=400)
#
#        favorite_company, created = FavoriteCompany.objects.get_or_create(user=user, company=company)
#        favorited = created
#
#        if not created:
#            favorite_company.delete()
#
#        return JsonResponse({"success": True, "favorited": favorited})
#
#    except Company.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Artist not found."}, status=404)
#    except Exception as e:
#        return JsonResponse({"success": False, "message": str(e)}, status=500)
#
#@api_view(['DELETE'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def remove_from_favorites(request, product_id):
#    try:
#        product = get_object_or_404(Product, id=product_id)
#        user = request.user
#        Favorite.objects.filter(user=user, product=product).delete()
#        return redirect('favorites')
#
#    except Product.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Product not found."}, status=404)
#
#@api_view(['DELETE'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def remove_from_favorites_artist(request, artist_id):
#    try:
#        artist = get_object_or_404(Artist, id=artist_id)
#        user = request.user
#        FavoriteArtist.objects.filter(user=user, artist=artist).delete()
#        return redirect('favorites')
#
#    except Artist.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Artist not found."}, status=404)
#
#
#@api_view(['DELETE'])
#@authentication_classes([SessionAuthentication, TokenAuthentication])
#@permission_classes([IsAuthenticated])
#def remove_from_favorites_company(request, company_id):
#    try:
#        company = get_object_or_404(Company, id=company_id)
#        user = request.user
#        FavoriteCompany.objects.filter(user=user, company=company).delete()
#        return redirect('favorites')
#
#    except Company.DoesNotExist:
#        return JsonResponse({"success": False, "message": "Company not found."}, status=404)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def process_payment(request):
    if request.method == 'POST' and 'complete_payment' in request.POST:
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            cart_items = CartItem.objects.filter(cart=cart)

            payment_method = request.POST.get('payment_method')
            shipping_address = request.POST.get('shipping_address')
            discount_code = request.POST.get('discount_code')
            
            if not cart_items.exists() and 'discount_applied' in request.session:
                request.session['discount_applied'] = False
                request.session.pop('discount_value', None)
                messages.info(request, "O código de desconto foi removido porque o carrinho está vazio.")


            if not payment_method or not shipping_address:
                messages.error(request, "Por favor, preencha todos os campos obrigatórios.")
                return redirect('payment_page')

            total = cart.total
            discount_value = 0
            discount_applied = False


            if discount_code and discount_code.lower() == 'primeiracompra':
                if not Purchase.objects.filter(user=user).exists():
                    discount_value = total * 0.10
                    total -= discount_value
                    request.session['discount_applied'] = True
                    request.session['discount_value'] = discount_value
                    messages.success(request, "Código de desconto aplicado com sucesso!")
                else:
                    messages.warning(request, "O código de desconto só é válido para a primeira compra.")
                    request.session['discount_applied'] = False

            shipping_cost = request.session.get('shipping_cost', 0)
            final_total = total + shipping_cost

            with transaction.atomic():
                purchase = Purchase.objects.create(
                    user=user,
                    date=timezone.now().date(),
                    paymentMethod=payment_method,
                    shippingAddress=shipping_address,
                    total_amount=final_total,
                    status='Em processamento',
                    discount_applied=discount_applied,
                    discount_value=discount_value
                )

                for item in cart_items:
                    product = item.product
                    product_type = product.get_product_type()
                    stock_available = product.get_stock()

                    if stock_available is not None and stock_available >= item.quantity:
                        if product_type == 'Vinil':
                            product.vinil.stock -= item.quantity
                            product.vinil.stock = max(0, product.vinil.stock)
                            product.vinil.save()

                        elif product_type == 'CD':
                            product.cd.stock -= item.quantity
                            product.cd.stock = max(0, product.cd.stock)
                            product.cd.save()

                        elif product_type == 'Accessory':
                            product.accessory.stock -= item.quantity
                            product.accessory.stock = max(0, product.accessory.stock)
                            product.accessory.save()

                        elif product_type == 'Clothing' and item.size:
                            size = item.size
                            size.stock -= item.quantity
                            size.stock = max(0, size.stock)
                            size.save()
                    else:
                        messages.error(request, f"Estoque insuficiente para {product.name}. Disponível: {stock_available}")
                        return redirect('payment_page')

                    PurchaseProduct.objects.create(
                        purchase=purchase,
                        product=product,
                        quantity=item.quantity
                    )

                request.session['clear_cart'] = True
                request.session['discount_applied'] = False
                request.session.pop('discount_value', None)

                url_with_success = f"{reverse('payment_page')}?success=1"
                return redirect(url_with_success)

        except Cart.DoesNotExist:
            messages.error(request, "Carrinho não encontrado.")
            return redirect('cart')
        except Exception as e:
            messages.error(request, f"Ocorreu um erro durante o processamento do pagamento: {str(e)}")
            return redirect('payment_page')

    return redirect('payment_page')


@login_required
def payment_confirmation(request):
    return render(request, 'payment_confirmation.html')

@login_required
def payment_page(request):
    user = request.user
    cart = Cart.objects.get(user=user)
    cart_items = CartItem.objects.filter(cart=cart)
    subtotal = cart.total

    discount_value = 0

    discount_applied = request.session.get('discount_applied', False)
    if discount_applied:
        discount_value = subtotal * 0.10 
        

    shipping_cost = 0
    if subtotal <= 100:
        if user.country == 'Portugal':
            shipping_cost = 4.99
        else:
            shipping_cost = 6.00

    request.session['shipping_cost'] = shipping_cost

    final_total = subtotal - discount_value + shipping_cost

    return render(request, 'payment.html', {
        "cart_items": cart_items,
        "subtotal": subtotal,
        "shipping_cost": shipping_cost,
        "final_total": final_total,
        "discount_value": discount_value,
        "discount_applied": discount_applied
    })

@api_view(['GET'])
def company_home(request):
    company_id = request.user.company.id if request.user.user_type == 'company' else None
    print("Company ID:", company_id)
    return render(request, 'company_home.html', {'company_id': company_id})

#@api_view(['GET'])
#def company_products(request, company_id):
#    company = get_object_or_404(Company, id=company_id)
#    products = Product.objects.filter(company=company)
#
#    for product in products:
#        if hasattr(product, 'clothing'): 
#            sizes = product.clothing.sizes.all()
#            product.size_stock = {
#                'XS': sizes.filter(size='XS').first().stock if sizes.filter(size='XS').exists() else 0,
#                'S': sizes.filter(size='S').first().stock if sizes.filter(size='S').exists() else 0,
#                'M': sizes.filter(size='M').first().stock if sizes.filter(size='M').exists() else 0,
#                'L': sizes.filter(size='L').first().stock if sizes.filter(size='L').exists() else 0,
#                'XL': sizes.filter(size='XL').first().stock if sizes.filter(size='XL').exists() else 0,
#            }
#        else:
#            product.size_stock = product.get_stock()
#    for product in products:
#        product.favorites_count = product.favorites.count()
#        product.reviews_count = product.reviews.count()
#
#    context = {
#        'company': company,
#        'products': products,
#    }
#
#    return render(request, 'company_products.html', {'company': company, 'products': products})

@api_view(['GET'])
def company_products(request, company_id):
    print(f"Received company_id: {company_id}")  # Debugging: Log the company_id
    company = get_object_or_404(Company, id=company_id)
    print(f"Found company: {company.name}")  # Debugging: Log the company name

    products = Product.objects.filter(company=company)
    print(f"Number of products found: {products.count()}")  # Debugging: Log the product count

    products_data = []
    for product in products:
        if hasattr(product, 'clothing'):
            sizes = product.clothing.sizes.all()
            size_stock = {
                'XS': sizes.filter(size='XS').first().stock if sizes.filter(size='XS').exists() else 0,
                'S': sizes.filter(size='S').first().stock if sizes.filter(size='S').exists() else 0,
                'M': sizes.filter(size='M').first().stock if sizes.filter(size='M').exists() else 0,
                'L': sizes.filter(size='L').first().stock if sizes.filter(size='L').exists() else 0,
                'XL': sizes.filter(size='XL').first().stock if sizes.filter(size='XL').exists() else 0,
            }
        else:
            size_stock = product.get_stock()

        products_data.append({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'image': product.image.url if product.image else None,
            'favorites_count': product.favorites.count(),
            'reviews_count': product.reviews.count(),
            'size_stock': size_stock,
        })

    response = {
        'company': {
            'id': company.id,
            'name': company.name,
            'logo': company.logo.url if company.logo else None,
        },
        'products': products_data,
    }

    print(f"Returning response: {response}")  # Debugging: Log the response
    return Response(response)


@api_view(['GET'])
def company_product_detail(request, company_id, product_id):
    company = get_object_or_404(Company, id=company_id)
    product = get_object_or_404(Product, id=product_id, company=company)

    # Contar favoritos e obter reviews
    product.favorites_count = product.favorites.count()
    reviews = product.reviews.all()


    if hasattr(product, 'clothing'):  # Check if it's a clothing product (with sizes)
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



def company_products_user(request, company_id):
    company = get_object_or_404(Company, id=company_id)
    products = Product.objects.filter(company=company)
    product_type = request.GET.get('type')
    if product_type:
        if product_type == 'Vinil':
            products = products.filter(vinil__isnull=False)
            genre = request.GET.get('genreVinyl')
            if genre:
                products = products.filter(vinil__genre=genre)
            logger.debug(f"Filtered by 'Vinil' type and genre {genre}, products count: {products.count()}")

        elif product_type == 'CD':
            products = products.filter(cd__isnull=False)
            genre = request.GET.get('genreCD')
            if genre:
                products = products.filter(cd__genre=genre)
            logger.debug(f"Filtered by 'CD' type and genre {genre}, products count: {products.count()}")

        elif product_type == 'Clothing':
            products = products.filter(clothing__isnull=False)
            color = request.GET.get('colorClothing')
            if color:
                products = products.filter(clothing__color=color)
            logger.debug(f"Filtered by 'Clothing' type and color {color}, products count: {products.count()}")

        elif product_type == 'Accessory':
            products = products.filter(accessory__isnull=False)
            color = request.GET.get('colorAccessory')
            if color:
                products = products.filter(accessory__color=color)
            size = request.GET.get('size')
            if size:
                products = products.filter(accessory__size=size)
            logger.debug(f"Filtered by 'Accessory' type, color {color}, and size {size}, products count: {products.count()}")

    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        try:
            products = products.filter(price__gte=float(min_price))
            logger.debug(f"Applied min price filter {min_price}, products count: {products.count()}")
        except ValueError:
            logger.debug("Invalid minimum price provided.")
    if max_price:
        try:
            products = products.filter(price__lte=float(max_price))
            logger.debug(f"Applied max price filter {max_price}, products count: {products.count()}")
        except ValueError:
            logger.debug("Invalid maximum price provided.")

    genres = Vinil.objects.values_list('genre', flat=True).distinct()
    colors = Clothing.objects.values_list('color', flat=True).distinct()
    return render(request, 'company_product_user.html', {'company': company, 'products': products, 'genres': genres, 'colors': colors})


@login_required
def add_product_to_company(request, company_id):
    company = get_object_or_404(Company, id=company_id)

    if request.method == 'POST':
        product_form = ProductForm(request.POST, request.FILES)

        vinil_form = VinilForm()
        cd_form = CDForm()
        clothing_form = ClothingForm()
        accessory_form = AccessoryForm()

        if product_form.is_valid():
            product = product_form.save(commit=False)
            product.company = company  

            price = product_form.cleaned_data.get('price')
            if price is None:
                return render(request, 'add_product_to_company.html', {
                    'form': product_form,
                    'error_message': "Price is required."
                })
            product.price = price 

            product_type = product_form.cleaned_data['product_type']

            if product_type == 'vinil':
                vinil_form = VinilForm(request.POST)
                if vinil_form.is_valid():
                    vinil = vinil_form.save(commit=False)
                    vinil.name = product.name
                    vinil.description = product.description
                    vinil.price = product.price
                    vinil.image = product.image
                    vinil.artist = product.artist
                    vinil.company = product.company
                    vinil.category = product.category
                    vinil.save()

            elif product_type == 'cd':
                cd_form = CDForm(request.POST)
                if cd_form.is_valid():
                    cd = cd_form.save(commit=False)
                    cd.name = product.name
                    cd.description = product.description
                    cd.price = product.price
                    cd.image = product.image
                    cd.artist = product.artist
                    cd.company = product.company
                    cd.category = product.category
                    cd.save()

            elif product_type == 'clothing':
                clothing_form = ClothingForm(request.POST)
                if clothing_form.is_valid():
                    clothing = clothing_form.save(commit=False)
                    clothing.name = product.name
                    clothing.description = product.description
                    clothing.price = product.price
                    clothing.image = product.image
                    clothing.artist = product.artist
                    clothing.company = product.company
                    clothing.category = product.category
                    clothing.save()

            elif product_type == 'accessory':
                accessory_form = AccessoryForm(request.POST)
                if accessory_form.is_valid():
                    accessory = accessory_form.save(commit=False)
                    accessory.name = product.name
                    accessory.description = product.description
                    accessory.price = product.price
                    accessory.image = product.image
                    accessory.artist = product.artist
                    accessory.company = product.company
                    accessory.category = product.category
                    accessory.save()
            return redirect('company_products', company_id=company.id)

        else:
            print("Product form errors:", product_form.errors)

    else:
        product_form = ProductForm()
        vinil_form = VinilForm()
        cd_form = CDForm()
        clothing_form = ClothingForm()
        accessory_form = AccessoryForm()

    context = {
        'company': company,
        'form': product_form,
        'vinil_form': vinil_form,
        'cd_form': cd_form,
        'clothing_form': clothing_form,
        'accessory_form': accessory_form,
    }

    return render(request, 'add_product_to_company.html', context)


"""
@api_view(['PUT'])
def edit_product(request, company_id, product_id):
    if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
        raise PermissionDenied
    company = get_object_or_404(Company, id=company_id)
    product = get_object_or_404(Product, id=product_id, company=company)

    initial_product_type = product.get_product_type().lower()

    if request.method == 'POST':
        product_form = ProductForm(request.POST, request.FILES, instance=product)

        if product_form.is_valid():
            product = product_form.save(commit=False)
            product.company = company

            price = product_form.cleaned_data.get('price')
            if price is None:
                return render(request, 'edit_product.html', {
                    'product_form': product_form,
                    'error_message': "Price is required.",
                    'company': company,
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
                    'company': company,
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

            if request.user.user_type == 'admin':
                return redirect('admin_home')
            else:
                return redirect('company_products', company_id=company.id)

    else:
        product_form = ProductForm(instance=product)
        vinil_form = VinilForm(
            instance=getattr(product, 'vinil', None)) if initial_product_type == 'vinil' else VinilForm()
        cd_form = CDForm(instance=getattr(product, 'cd', None)) if initial_product_type == 'cd' else CDForm()
        clothing_form = ClothingForm(
            instance=getattr(product, 'clothing', None)) if initial_product_type == 'clothing' else ClothingForm()
        accessory_form = AccessoryForm(
            instance=getattr(product, 'accessory', None)) if initial_product_type == 'accessory' else AccessoryForm()

    context = {
        'company': company,
        'product': product,
        'product_form': product_form,
        'vinil_form': vinil_form,
        'cd_form': cd_form,
        'clothing_form': clothing_form,
        'accessory_form': accessory_form,
        'initial_product_type': initial_product_type,
    }

    return render(request, 'edit_product.html', context)
"""

@api_view(['PUT'])
def edit_product(request, product_id):
    if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
        raise PermissionDenied
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


def delete_product(request, product_id):
    print(request.user.user_type)
    print(request)
    if not (request.user.user_type == 'admin' or request.user.user_type == 'company'):
        print("User is not admin or company")
        raise PermissionDenied
    product = get_object_or_404(Product, id=product_id)
    company_id = product.company.id 
    product.delete()
    return redirect('company_products', company_id=company_id)




@api_view(['GET'])
def get_users(request):
    users = User.objects.all()
    serialized_users = UserSerializer(users, many=True)
    print(serialized_users.data)
    return Response(serialized_users.data)

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return redirect('admin_home')

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def admin_product_delete(request, product_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return redirect('admin_home')

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_review(request, review_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    review = get_object_or_404(Review, id=review_id)
    product = review.product
    company = product.company

    if request.user.user_type == 'admin' or (request.user.user_type == 'company' and request.user.company == company):
        review.delete()
        messages.success(request, "Avaliação removida com sucesso.")
        return redirect('company_product_detail', company_id=company.id, product_id=product.id)
    else:
        messages.error(request, "Apenas administradores ou o proprietário da companhia podem remover avaliações.")
        return redirect('company_product_detail', company_id=company.id, product_id=product.id)

@login_required
def admin_company_delete(request, company_id):
    if not request.user.is_superuser:
        raise PermissionDenied
    company = get_object_or_404(Company, id=company_id)
    company.delete()
    return redirect('admin_home')

@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_company(request):
    if request.method == 'POST':
        company_form = CompanyForm(request.POST, request.FILES)
        user_form = UserForm(request.POST)

        if company_form.is_valid() and user_form.is_valid():
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
                user.save()

                messages.success(request, 'Company and associated user have been created successfully.')
                return redirect('admin_home')
        else:
            messages.error(request, 'Please correct the errors below.')

    else:
        company_form = CompanyForm()
        user_form = UserForm()

    return render(request, 'add_company.html', {
        'company_form': company_form,
        'user_form': user_form,
    })

@login_required
def order_details(request, order_id):
    purchase = get_object_or_404(Purchase, id=order_id, user=request.user)
    products = [
        {
            "name": item.product.name,
            "quantity": item.quantity,
            "unit_price": item.product.price, 
            "total_price": item.quantity * item.product.price, 
            "image_url": item.product.image.url  
        }
        for item in purchase.purchase_products.all()
    ]
    data = {
        "date": purchase.date,
        "total_amount": purchase.total_amount,
        "paymentMethod": purchase.paymentMethod,
        "shippingAddress": purchase.shippingAddress,
        "status": purchase.status,
        "products": products,
    }
    return JsonResponse(data)

@login_required
def apply_discount(request):
    if request.method == 'POST':
        user = request.user
        data = json.loads(request.body)
        discount_code = data.get('discount_code')

        if discount_code and discount_code.lower() == 'primeiracompra':
            if not Purchase.objects.filter(user=user).exists():
                request.session['discount_applied'] = True
                return JsonResponse({"success": True})
            else:
                return JsonResponse({"success": False, "message": "O código de desconto só é válido para a primeira compra."})
        
        return JsonResponse({"success": False, "message": "Código de desconto inválido."})
    
    return JsonResponse({"success": False, "message": "Método não permitido."}, status=405)

@login_required
def add_clothing_stock(request, product_id):
    if request.method == "POST":
        product = get_object_or_404(Clothing, id=product_id)

        # Retrieve quantities from form
        size_quantities = {
            "XS": int(request.POST.get("size_xs", 0)),
            "S": int(request.POST.get("size_s", 0)),
            "M": int(request.POST.get("size_m", 0)),
            "L": int(request.POST.get("size_l", 0)),
            "XL": int(request.POST.get("size_xl", 0)),
        }

        for size, quantity in size_quantities.items():
            if quantity > 0:  # Only proceed if quantity is greater than zero
                size_instance, created = Size.objects.get_or_create(
                    clothing=product,
                    size=size,
                    defaults={'stock': quantity}
                )
                if not created:
                    size_instance.stock = quantity
                    size_instance.save()

        messages.success(request, "Stock atualizado com sucesso!")
        return redirect('productDetails', identifier=product.id)
    return redirect('product_list')

@login_required
def add_stock(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == 'POST':
        stock = int(request.POST.get('stock', 0))

        product_type = product.get_product_type()

        if product_type == 'Vinil':
            vinil = product.vinil
            vinil.stock = stock  
            vinil.save()         
        elif product_type == 'CD':
            cd = product.cd       
            cd.stock = stock      
            cd.save()             
        elif product_type == 'Accessory':
            accessory = product.accessory  
            accessory.stock = stock       
            accessory.save()              
        elif product_type == 'Clothing':
            clothing = product.clothing   
            for size in clothing.sizes.all():  
                size.stock = stock
                size.save()
            clothing.save()   
        else:
            return JsonResponse({'error': 'Invalid product type for stock update'}, status=400)

        product.save()

        return redirect('company_product_detail', company_id=product.company.id, product_id=product.id)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


"""
@login_required
def admin_home(request):
    if not request.user.is_superuser:  # Ensure user is an admin
        raise PermissionDenied
    users = User.objects.all()
    products = Product.objects.all()
    companies = Company.objects.all()
    for product in products:
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
    for product in products:
        product.favorites_count = product.favorites.count()
        product.reviews_count = product.reviews.count()

    for product in products:
        product.review_count = Review.objects.filter(product=product).count()

    for user in users:
        user.number_of_purchases = Purchase.objects.filter(user=user).count()
    return render(request, 'admin_home.html', {'users': users, 'products': products, 'companies': companies})
"""