# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Testing for the events app.
"""

# mypy: ignore-errors
import pytest

from events.factories import (
    EventFactory,
    EventAttendeeFactory,
    EventAttendeeStatusFactory,
    FormatFactory,
    RoleFactory,
)
from events.models import EventText

pytestmark = pytest.mark.django_db


def test_str_methods() -> None:
    event = EventFactory.create()
    event_attendee = EventAttendeeFactory.create()
    event_attendee_status = EventAttendeeStatusFactory.create()
    _format = FormatFactory.create()
    role = RoleFactory.create()

    assert str(event) == event.name
    assert str(event_attendee) == f"{event_attendee.user} - {event_attendee.event}"
    assert str(event_attendee_status) == event_attendee_status.status_name
    assert str(_format) == _format.name
    assert str(role) == role.name


def test_event_text_str_method() -> None:
    event = EventFactory.create()
    event_text = EventText.objects.create(
        event=event,
        iso="en",
        primary=True,
        description="Test description",
        get_involved="Get involved text"
    )
    assert str(event_text) == f"{event_text.event} - {event_text.iso}"
