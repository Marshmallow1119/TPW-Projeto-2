"""
URL configuration for merchify project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('', views.home, name='home'),
    path('ws/home/', views.home, name='home'),
    path('ws/admin_home/', views.admin_home, name='admin_home'),
    path('ws/produtos/', views.produtos, name='produtos'),
    path('ws/artists/', views.artistas, name='artistas'),
    path('ws/login/', views.login, name='login'),
    path("ws/logout", views.logout, name="logout"),
    path('ws/products/<str:name>/', views.artistsProducts, name='artistsProducts'),
    path('ws/product/<int:identifier>/',  views.productDetails, name='productDetails'),
    path('ws/search/', views.search, name='search'),
    path('ws/register/', views.register_view, name='register'),
    path('ws/cart/', views.viewCart, name='cart'),
    path('ws/add-to-cart/<int:product_id>/', views.add_to_cart, name = 'add_to_cart'),
    path('ws/remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),
    path("ws/account/profile", views.profile, name="profile"),
    path("ws/product/<int:product_id>/submit_review/", views.submit_review, name="submit_review"),
    path('ws/company/<int:company_id>/products/', views.company_products, name='company_products'),
    path('ws/company/products/<int:company_id>', views.company_products_user, name='company_products_user'),
    path('ws/company/<int:company_id>/add-product/', views.add_product_to_company, name='add_product_to_company'),
    path('ws/company/<int:company_id>/product/<int:product_id>/detail/', views.company_product_detail, name='company_product_detail'),
    path('ws/review/<int:review_id>/delete/', views.delete_review, name='delete_review'),  
    path('ws/product/<int:company_id>/<int:product_id>/edit/', views.edit_product, name='edit_product'),
    path('ws/product/<int:product_id>/delete/', views.delete_product, name='delete_product'),
    path('ws/favorites/', views.checkfavoriteOld, name='favorites'),
    path('ws/favorites/<str:category>/', views.checkfavorite, name='favorites2'),
    path('ws/favorites/add/<int:product_id>/', views.addtofavorite, name='addtofavorite'),
    path('ws/favorites/add/artist/<int:artist_id>/', views.addtofavoriteartist, name="addtofavoriteartist"),
    path('ws/favorites/add/company/<int:company_id>/', views.addtofavoritecompany, name="addtofavoritecompany"),

    path('ws/favorites/remove/<int:product_id>/', views.remove_from_favorites, name='remove_from_favorites'),
    path('ws/favorites/remove/artist/<int:artist_id>/', views.remove_from_favorites_artist, name='remove_from_favorites_artist'),
    path('ws/favorites/remove/company/<int:company_id>/', views.remove_from_favorites_company, name='remove_from_favorites_company'),

    path('ws/payment/', views.payment_page, name='payment_page'),
    path('ws/delete_user/<int:user_id>/', views.delete_user, name='delete_user'),
    path('ws/process_payment/', views.process_payment, name='process_payment'),
    path('ws/payment-confirmation/', views.payment_confirmation, name='payment_confirmation'),
    path('ws/admin_home/delete/<int:product_id>', views.admin_product_delete, name='admin_product_delete'),
    path('ws/admin_home/delete/company/<int:company_id>', views.admin_company_delete, name='admin_company_delete'),
    path('ws/admin_home/add/company',views.add_company, name='add_company'),
    path('ws/account/order_details/<int:order_id>/', views.order_details, name='order_details'),
    path('ws/delete/review/<int:review_id>/', views.delete_review, name='delete_review'),
    path('ws/apply_discount/', views.apply_discount, name='apply_discount'),
    path('ws/companhias/', views.companhias, name='companhias'),
    path('ws/update-cart-item/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('ws/carrinho/', views.viewCart, name='viewCart'),
    path('ws/product/<int:product_id>/add_clothing_stock/', views.add_clothing_stock, name='add_clothing_stock'),
    path('ws/product/<int:product_id>/add_stock/', views.add_stock, name='add_stock'),

]   


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)