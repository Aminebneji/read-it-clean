// Données d'entrée pour la génération de texte avec Claude
export interface ClaudeGenerationInput {
    link: string;
    description: string;
}


//  Résultat de la génération de texte avec Claude 
export interface ClaudeGenerationOutput {
    generatedText: string;
    originalLink: string;
    originalDescription: string;
}
