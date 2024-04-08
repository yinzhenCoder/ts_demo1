
export default interface FdmCard {
    id: string;
    code: string;
    auxCode: string;
    categoryCode: string;
    name: string;
    contentId: string | null;
    trialContentId: string | null;
    note: string | null;
    status: number | null;

}
