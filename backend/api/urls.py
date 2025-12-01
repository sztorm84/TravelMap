from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TravelListViewSet, PinViewSet, PostViewSet, PostImageViewSet

router = DefaultRouter()
router.register(r'travel-lists', TravelListViewSet, basename='travel-list')
router.register(r'pins', PinViewSet, basename='pin')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'post-images', PostImageViewSet, basename='post-image')

urlpatterns = [
    path('', include(router.urls)),
]