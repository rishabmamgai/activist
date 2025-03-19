# SPDX-License-Identifier: AGPL-3.0-or-later
from django.apps import AppConfig


class CommunitiesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "communities"

    def ready(self) -> None:
        import communities.signals    # noqa
