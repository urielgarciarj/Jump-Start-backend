export class UserSkillProfileDto {
    userId: number;
    name: string;
    lastName: string;
    email: string;
    picture?: string;
    university?: string;
    expandedSkills: string[];
    skillFrequency: { [key: string]: number };
    matchScore: number;
    matchPercentage: number;
}

export class UserRecommendationResponseDto {
    projectId: number;
    projectName: string;
    projectRequirements: string[];
    recommendedUsers: UserSkillProfileDto[];
}

export class ProjectUserRecommendationsResponseDto {
    message: string;
    recommendations: UserRecommendationResponseDto[];
} 