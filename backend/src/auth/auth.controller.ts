import { Controller, Post, Get, UseGuards, Request, Response, Body } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
    @Body() loginDto: LoginDto,
  ) {
    const result = await this.authService.login(req.user);

    // Set JWT as httpOnly cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: ExpressRequest) {
    return this.authService.getProfile((req.user as any).id);
  }

  @Post('logout')
  async logout(@Response({ passthrough: true }) res: ExpressResponse) {
    res.clearCookie('jwt');
    return { message: 'Sesión cerrada' };
  }
}
