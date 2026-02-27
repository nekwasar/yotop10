"""
Seed script — run once after first migration to populate lookup tables.
Usage (inside backend container or with venv active):
    python -m app.seed
"""
import uuid
from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.category import Category
from app.models.badge import Badge
from app.models.moderation import AutoHideRule, AutoHideRuleType


CATEGORIES = [
    ("Film & TV", "film-tv"),
    ("Music", "music"),
    ("Sports", "sports"),
    ("Science & Tech", "science-tech"),
    ("History", "history"),
    ("Politics", "politics"),
    ("Food & Drink", "food-drink"),
    ("Travel", "travel"),
    ("Gaming", "gaming"),
    ("Books & Literature", "books-literature"),
    ("Pop Culture", "pop-culture"),
    ("Business", "business"),
    ("Environment", "environment"),
    ("Philosophy", "philosophy"),
    ("True Crime", "true-crime"),
    ("Other", "other"),
]

BADGES = [
    ("Author", "author", "20 posts approved for the public feed", "⭐"),
    ("Hot Lister", "hot-lister", "3+ posts reached the Hot Takes page", "🔥"),
    ("Fact Master", "fact-master", "10+ posts with CONFIRMED community verdict", "✅"),
    ("Rival Champion", "rival-champion", "Won 3+ Battle View votes", "⚔️"),
    ("List of the Year", "list-of-the-year", "Annual best list award", "🏆"),
    ("Most Controversial", "most-controversial", "Most challenged posts in a month", "💀"),
    ("Mind Changer", "mind-changer", "Highest Big Brain reactions on a post", "🧠"),
]

AUTO_HIDE_RULES = [
    (AutoHideRuleType.report_threshold, True, {"threshold": 5, "within_hours": 2}),
    (AutoHideRuleType.keyword_filter, True, {"keywords": []}),
    (AutoHideRuleType.anonymous_spam, True, {"max_posts": 3, "within_minutes": 30}),
    (AutoHideRuleType.new_user_rate, True, {"max_posts": 5, "within_hours": 1, "account_age_days": 7}),
    (AutoHideRuleType.engagement_anomaly, True, {"same_day_account_reports": 3}),
]


def seed():
    with Session(engine) as db:
        # Seed categories
        existing_cats = {c.slug for c in db.query(Category).all()}
        for name, slug in CATEGORIES:
            if slug not in existing_cats:
                db.add(Category(id=uuid.uuid4(), name=name, slug=slug))
        print(f"Categories: {len(CATEGORIES)} total")

        # Seed badges
        existing_badges = {b.slug for b in db.query(Badge).all()}
        for name, slug, description, icon in BADGES:
            if slug not in existing_badges:
                db.add(Badge(id=uuid.uuid4(), name=name, slug=slug, description=description, icon=icon))
        print(f"Badges: {len(BADGES)} total")

        # Seed auto-hide rules
        existing_rules = {r.rule_type for r in db.query(AutoHideRule).all()}
        for rule_type, is_enabled, config in AUTO_HIDE_RULES:
            if rule_type not in existing_rules:
                db.add(AutoHideRule(id=uuid.uuid4(), rule_type=rule_type, is_enabled=is_enabled, config=config))
        print(f"AutoHideRules: {len(AUTO_HIDE_RULES)} total")

        db.commit()
        print("✅ Seed complete.")


if __name__ == "__main__":
    seed()
