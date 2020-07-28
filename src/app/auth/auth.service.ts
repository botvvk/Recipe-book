import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators"
import { throwError, Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}


@Injectable({
    providedIn: "root"
})
export class AuthService {
    user = new BehaviorSubject<User>(null);


    constructor(private http: HttpClient, private router: Router) { }



    signUp(email: string, password: string) {
        return this.http.post<AuthResponseData>("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + environment.firebaseApiKey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            })
            .pipe(catchError(this.handleError),
                tap(resData => {
                    this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
                })
            )

    };

    logIn(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseApiKey, {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(resData => {
            this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
        })
        )
    }

    logOut() {
        this.user.next(null);
        this.router.navigate(['auth']);
    }

    private handleAuth(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000)
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        )
        this.user.next(user)
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'an unknown error occured'
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage)
        }
        switch (errorRes.error.error.message) {
            case "EMAIL_EXISTS":
                errorMessage = "This email already exists!"
                break;
            case "EMAIL_NOT_FOUND":
                errorMessage = "Email does not exist"
                break;
            case "INVALID_PASSWORD":
                errorMessage = "invalid password"
                break;
            case "EMAIL_NOT_FOUND":
                errorMessage = "email not found"
                break;
        }
        return throwError(errorMessage)
    }
}