from django.urls import path

from . import views

urlpatterns = [
    path("quotes/", views.QuoteRequestView.as_view(), name="quote-create"),
    path("contact/", views.ContactMessageView.as_view(), name="contact-create"),
    path("appointments/slots/", views.AppointmentSlotListView.as_view(), name="appointment-slots"),
    path("appointments/", views.AppointmentBookingView.as_view(), name="appointment-create"),
    path(
        "newsletter/subscribe/",
        views.NewsletterSubscribeView.as_view(),
        name="newsletter-subscribe",
    ),
    path("newsletter/confirm/", views.NewsletterConfirmView.as_view(), name="newsletter-confirm"),
    path("academy/waitlist/", views.AcademyWaitlistView.as_view(), name="academy-waitlist"),
]
