import { Company } from "./company";
import { User } from "./user";

export interface Chat {
    id: number;
    user: User;
    company: Company;
    created_at: Date;
}

export interface Message {
    id: number;
    chat: Chat;
    sender: User;
    is_from_company: boolean;
    text: string;
    date: Date;
}