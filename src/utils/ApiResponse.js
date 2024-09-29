class ApiResponse{

    constructor(statusCode, message="success",data){
        this.statusCode = statusCode
        this.data =  data
        this.message = message
        // success is true only if status code is less than 400
        this.success = statusCode<400
    }
}

export {ApiResponse}