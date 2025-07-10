import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { HistoryPage } from './pages/history-page/history-page';
import { ChatPage } from './pages/chat-page/chat-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';

export const routes: Routes = [
    {
        path:'',
        component: HomePage
    },
    {
        path: 'history',
        component: HistoryPage
    },
    {
        path:'chat',
        component: ChatPage
    },
    {
        path:'login',
        component: LoginPage
    },
        {
        path:'register',
        component: RegisterPage
    },
];
