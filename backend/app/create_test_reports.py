from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.report import Report
from app.models.user import User
from datetime import datetime, timedelta
import random

# Sample content for reports
TOPICS = ["Development", "Design", "Marketing", "Sales", "Support"]
TITLES = [
    "Monthly Progress Report",
    "Project Status Update",
    "Team Performance Review",
    "Customer Feedback Analysis",
    "Market Research Findings",
]

CONTENT_TEMPLATES = [
    """# {title}

## Overview
This report covers the {topic} activities for {period}.

### Key Highlights
1. Achieved major milestone in {topic}
2. Completed {count} tasks ahead of schedule
3. Identified {count} areas for improvement

### Detailed Analysis
* Team performance exceeded expectations
* Successfully implemented new {topic} strategies
* Received positive feedback from stakeholders

## Metrics
1. Completion Rate: {completion_rate}%
2. Customer Satisfaction: {satisfaction}%
3. Team Productivity: {productivity}%

### Next Steps
1. Continue monitoring progress
2. Implement feedback from stakeholders
3. Plan next phase of development

![Chart showing progress](https://via.placeholder.com/640x480.png?text=Sample+Chart)

## Conclusion
The {topic} team has shown significant progress and we expect to maintain this momentum going forward.""",

    """# {title}

## Executive Summary
A comprehensive review of our {topic} initiatives for {period}.

### Achievements
* Launched {count} new features
* Resolved {count} critical issues
* Improved overall performance by {productivity}%

## Detailed Report
1. Project Status
   * On track with timeline
   * Budget utilization at {completion_rate}%
   * Resource allocation optimized

2. Key Metrics
   * User satisfaction: {satisfaction}%
   * System uptime: 99.9%
   * Response time: < 100ms

![Performance metrics](https://via.placeholder.com/640x480.png?text=Performance+Metrics)

### Recommendations
1. Increase resource allocation
2. Implement automated testing
3. Enhance monitoring systems

## Looking Forward
We plan to focus on scaling our {topic} operations in the coming month."""
]

def create_test_reports(db: Session, user_id: int, count: int = 25):
    """Create test reports for pagination testing."""
    reports = []
    current_date = datetime.now()
    
    for i in range(count):
        # Generate random data
        topic = random.choice(TOPICS)
        title = random.choice(TITLES).replace("Report", f"Report {i+1}")
        template = random.choice(CONTENT_TEMPLATES)
        
        # Generate random metrics
        metrics = {
            "topic": topic,
            "title": title,
            "period": (current_date - timedelta(days=i*3)).strftime("%B %Y"),
            "count": random.randint(3, 15),
            "completion_rate": random.randint(75, 100),
            "satisfaction": random.randint(80, 100),
            "productivity": random.randint(85, 100)
        }
        
        # Create report
        report = Report(
            title=title,
            content=template.format(**metrics),
            user_id=user_id,
            created_at=current_date - timedelta(days=i*3)
        )
        reports.append(report)
    
    db.bulk_save_objects(reports)
    db.commit()
    return reports

def main():
    # Get the test user
    db = next(get_db())
    user = db.query(User).filter(User.email == "test@example.com").first()
    
    if not user:
        print("Test user not found. Please create a test user first.")
        return
    
    # Create test reports
    reports = create_test_reports(db, user.id)
    print(f"Created {len(reports)} test reports for user {user.email}")

if __name__ == "__main__":
    main()
