export interface Trash {
    id: string;
    name: string;
    icon: string;
    downloadable: boolean;
    downloadURL?: string;
}

export const trash: Trash[] = [
    {
        id: "trash-1",
        name: "Keerat-Panwar-Resume.pdf",
        icon: "/images/icons/pdf.png",
        downloadable: true,
        downloadURL: "/resume/Keerat-Panwar-Resume.pdf"
    }
]
