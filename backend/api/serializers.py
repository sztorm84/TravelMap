from rest_framework import serializers
from .models import TravelList, Pin, Post, PostImage
import json

class PinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pin
        exclude = ['post', 'travel_list'] 
        extra_kwargs = {
            'id': {'read_only': False, 'required': False}
        }

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']

class PostSerializer(serializers.ModelSerializer):
    pins = PinSerializer(many=True, read_only=True)
    gallery = PostImageSerializer(many=True, read_only=True)
    pins_data = serializers.CharField(write_only=True, required=False)
    uploaded_gallery = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    images_to_delete = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Post
        fields = '__all__'
        extra_kwargs = {'author': {'read_only': True}}

    def create(self, validated_data):
        pins_json = validated_data.pop('pins_data', '[]')
        gallery_files = validated_data.pop('uploaded_gallery', [])
        validated_data.pop('images_to_delete', [])

        post = Post.objects.create(**validated_data)

        if pins_json:
            pins_list = json.loads(pins_json)
            for pin_data in pins_list:
                if 'id' in pin_data: del pin_data['id'] 
                Pin.objects.create(post=post, **pin_data)

        for image in gallery_files:
            PostImage.objects.create(post=post, image=image)

        return post

    def update(self, instance, validated_data):
        pins_json = validated_data.pop('pins_data', None)
        gallery_files = validated_data.pop('uploaded_gallery', [])
        images_to_delete = validated_data.pop('images_to_delete', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if 'map_center_lat' in validated_data:
            instance.map_center_lat = validated_data['map_center_lat']
        if 'map_center_lng' in validated_data:
            instance.map_center_lng = validated_data['map_center_lng']

        instance.save()

        if images_to_delete:
            PostImage.objects.filter(id__in=images_to_delete, post=instance).delete()

        if pins_json is not None:
            instance.pins.all().delete()
            pins_list = json.loads(pins_json)
            for pin_data in pins_list:
                if 'id' in pin_data: del pin_data['id']
                Pin.objects.create(post=instance, **pin_data)

        for image in gallery_files:
            PostImage.objects.create(post=instance, image=image)

        return instance

class TravelListSerializer(serializers.ModelSerializer):
    pins = PinSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = TravelList
        fields = ['id', 'owner', 'name', 'description', 'created_at', 'pins']