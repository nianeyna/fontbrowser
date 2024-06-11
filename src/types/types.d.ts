type Font = {
    file: string,
    fullName: string,
    subfamilyName: string
}

type FontDetails = {
    features: string[],
    characters: number[],
    characterString: string
}

type Feature = {
    friendlyName?: string,
    registeredBy?: string,
    function?: string,
    example?: string,
    implementation?: string,
    interface?: string,
    suggestion?: string,
    sensitivity?: string,
    interaction?: string
}

type SearchAndFilterOptions = {
    searchTerm?: string,
    characters?: string,
    includedTags: string[],
    excludedTags: string[],
    selectedFeaturesOnly: boolean,
    secretOpenTypeFeatures: boolean
}

type Settings = {
    searchOptions?: SearchAndFilterOptions,
    tags?: [string, string[]][],
    fontFolders?: FontFolder[],
    darkMode?: boolean
}

type FontFolder = {
    folderPath: string,
    subfolders: boolean
}
