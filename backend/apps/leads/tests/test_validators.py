import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.leads.validators import validate_attachment


@pytest.mark.parametrize(
    ("name", "content", "expected"),
    [
        ("rapport.pdf", b"%PDF-1.4 ...", "application/pdf"),
        ("photo.JPG", b"\xff\xd8\xff\xe0 jfif", "image/jpeg"),
        ("schema.png", b"\x89PNG\r\n\x1a\n...", "image/png"),
        (
            "note.docx",
            b"PK\x03\x04 ...",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
    ],
)
def test_accepted_files(name, content, expected):
    assert validate_attachment(SimpleUploadedFile(name, content)) == expected


@pytest.mark.parametrize(
    ("name", "content"),
    [
        ("virus.exe", b"MZ\x90\x00"),
        ("script.svg", b"<svg onload=alert(1)>"),  # SVG refusé : peut contenir du script
        ("page.html", b"<html>"),
        ("faux.png", b"%PDF-1.4"),  # extension et contenu incohérents
        ("vide.pdf", b""),
        ("sans-extension", b"%PDF-1.4"),
    ],
)
def test_rejected_files(name, content):
    with pytest.raises(ValidationError):
        validate_attachment(SimpleUploadedFile(name, content))
