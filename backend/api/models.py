from django.db import models
from django.contrib.auth.models import User

class TravelList(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='travel_lists')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"



class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    short_description = models.TextField()
    content = models.TextField()
    cover_image = models.ImageField(upload_to='blog_covers/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    linked_list = models.ForeignKey(TravelList, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title
    
class Pin(models.Model):
    travel_list = models.ForeignKey(TravelList, on_delete=models.CASCADE, related_name='pins', null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='pins', null=True, blank=True)
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    color = models.CharField(max_length=20, default="#3b82f6")

    def __str__(self):
        return self.name

class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name='gallery', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='blog_gallery/')