declare function createUser(data: {
    name: string;
    email: string;
    password: string;
}): Promise<{
    user: import("mongoose").Document<unknown, {}, import("../models/user.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/user.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    token: string;
}>;
declare const _default: {
    createUser: typeof createUser;
};
export default _default;
//# sourceMappingURL=user-service.d.ts.map