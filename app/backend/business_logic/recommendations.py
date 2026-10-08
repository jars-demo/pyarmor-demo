"""Turn a classification into a next action. The playbook is part of the product's know-how."""

PLAYBOOK = {
    "strategic": (
        "assign-account-manager",
        "Assign a dedicated account manager and plan a quarterly review.",
    ),
    "growth": (
        "offer-upgrade",
        "Offer the next plan tier with a 60-day trial of premium features.",
    ),
    "nurture": ("send-onboarding", "Enrol in the guided onboarding series to lift engagement."),
    "watch": ("monitor", "Monitor monthly; no outreach until engagement improves."),
}

# Above this risk score, any recommendation needs a human check first.
HIGH_RISK = 60.0

# Below this engagement, upsell offers are swapped for re-engagement.
LOW_ENGAGEMENT = 0.25


def generate_recommendation(classification: str, risk_score: float, engagement: float) -> dict:
    """Pick the action for a class, then adjust it for risk and engagement."""
    action, message = PLAYBOOK.get(classification, PLAYBOOK["watch"])

    if classification == "growth" and engagement < LOW_ENGAGEMENT:
        action, message = PLAYBOOK["nurture"]

    return {
        "action": action,
        "message": message,
        "requires_review": risk_score >= HIGH_RISK,
    }
