from django.contrib import admin
from .models import TravelList, Pin, Post, PostImage

admin.site.register(TravelList)
admin.site.register(Pin)
admin.site.register(Post)
admin.site.register(PostImage)