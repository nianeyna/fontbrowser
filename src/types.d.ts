interface Font {
    file: string,
    fullName: string,
    subfamilyName: string
}

interface FontDetails {
    features: string[],
    characters: number[]
}

interface Feature {
    friendlyName: string,
    registeredBy: string,
    function: string,
    example: string,
    implementation: string,
    interface: string,
    suggestion: string,
    sensitivity: string,
    interaction: string
}

interface SearchAndFilterOptions {
    searchTerm?: string,
    characters?: string,
    selectedFeaturesOnly: boolean,
    secretOpenTypeFeatures: boolean,
}
