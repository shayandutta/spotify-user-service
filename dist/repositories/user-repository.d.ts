declare class UserRepository {
    create(data: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("../models/user.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/user.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/user.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/user.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    get(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/user.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/user.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export default UserRepository;
//# sourceMappingURL=user-repository.d.ts.map