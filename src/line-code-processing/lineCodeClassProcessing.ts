export interface LineCodeClassProcessing {
    doesContainClassDeclaration(loc: string): boolean;
    getClassName(loc: string): string;
}