from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        project = self.get_object()

        # ONLY admin (creator) can update
        if project.created_by != self.request.user:
            raise PermissionDenied("Only admin can update project")

        serializer.save()

    def perform_destroy(self, instance):
        # ONLY admin can delete
        if instance.created_by != self.request.user:
            raise PermissionDenied("Only admin can delete project")

        instance.delete()


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        task = self.get_object()

        # Only assigned user OR project admin
        if (
            task.assigned_to != self.request.user and
            task.project.created_by != self.request.user
        ):
            raise PermissionDenied("Not allowed")

        serializer.save()


@api_view(['POST'])
def register(request):
    user = User.objects.create_user(
        username=request.data['username'],
        password=request.data['password']
    )
    return Response({"message": "User created"})