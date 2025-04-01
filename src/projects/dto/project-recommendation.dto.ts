export class ProjectRecommendationDto {
    id: number;
    name: string;
    description: string;
    category: string;
    requirements: string;
    startDate: Date;
    endDate: Date;
    professor: {
        id: number;
        name: string;
        lastName: string;
        picture: string | null;
        university: string | null;
    };
    matchPercentage: number;
    matchingSkills: string[];
    exactMatches: string[];
    partialMatches: string[];
}

export class ProjectRecommendationsResponseDto {
    message: string;
    recommendations: ProjectRecommendationDto[];
} 