"""Admin Django de secours (le back-office dédié arrive à l'étape 2).

Les créneaux de rendez-vous se gèrent ici en attendant ; voir aussi la commande
`python manage.py generate_slots`.
"""

from django.contrib import admin

from .models import (
    AcademyWaitlistEntry,
    Appointment,
    AppointmentSlot,
    ContactMessage,
    NewsletterSubscriber,
    QuoteAttachment,
    QuoteRequest,
)


class QuoteAttachmentInline(admin.TabularInline):
    model = QuoteAttachment
    extra = 0
    fields = ["original_name", "content_type", "size"]
    readonly_fields = fields
    can_delete = False


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "created_at", "service", "sector", "company", "full_name", "status"]
    list_filter = ["status", "service", "sector", "locale"]
    search_fields = ["company", "full_name", "email"]
    inlines = [QuoteAttachmentInline]


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["created_at", "subject", "full_name", "email", "status"]
    list_filter = ["status", "locale"]
    search_fields = ["subject", "full_name", "email"]


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ["start", "duration_minutes", "is_active", "is_booked"]
    list_filter = ["is_active"]
    list_editable = ["is_active"]
    date_hierarchy = "start"

    @admin.display(boolean=True, description="réservé")
    def is_booked(self, obj):
        return hasattr(obj, "appointment")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["slot", "full_name", "company", "mode", "topic"]
    list_filter = ["mode", "topic"]
    search_fields = ["full_name", "email", "company"]


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ["email", "status", "locale", "created_at", "confirmed_at"]
    list_filter = ["status", "locale"]
    search_fields = ["email"]
    exclude = ["token_hash"]
    readonly_fields = ["token_sent_at", "confirmed_at"]


@admin.register(AcademyWaitlistEntry)
class AcademyWaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ["email", "full_name", "profile", "locale", "created_at"]
    list_filter = ["profile", "locale"]
    search_fields = ["email", "full_name"]
