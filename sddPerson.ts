
export default interface SddPerson {
    id: string;
    name: string;
    idCardType: string;
    idCardNo: string;
    idCardImageUrl: string | null;
    gender: string;
    mergerId: string | null;
    status: string;
    latestUpdate: Date;
    dob: Date | null;

}
