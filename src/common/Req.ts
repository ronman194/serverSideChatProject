class Req {
    body = {};
    userId = null;
    params = {};
    query = {};
    constructor(body, userId, params = null, query = null) {
        this.body = body;
        this.userId = userId;
        this.params = params;
        this.query = query;
    }
    //cons
    static fromRestRequest(req) {
        return new Req(req.body, req.userId, req.params, req.query);
    }
}
export = Req;
