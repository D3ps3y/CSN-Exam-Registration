# Generated by Django 5.1.6 on 2025-04-24 13:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0005_remove_exam_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exam',
            name='building',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='exam',
            name='exam_number',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='exam',
            name='exam_subject',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='exam',
            name='location',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='exam',
            name='room_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
