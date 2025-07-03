import { Injectable, Logger } from '@nestjs/common';
import { CreateIncidentReportDto } from './dto/create-incident-report.dto';
import { UpdateIncidentReportDto } from './dto/update-incident-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import errorHandler from 'src/utils/functions/errorHandler';
import extractUserId from 'src/utils/functions/extractUserId';
import { JwtService } from '@nestjs/jwt';
import notFound from 'src/utils/functions/notFound';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncidentReportService {
  private logger: Logger = new Logger(IncidentReportService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    createIncidentReportDto: CreateIncidentReportDto,
    accessToken: string,
  ) {
    try {
      const id = extractUserId(accessToken, this.jwtService);

      const user = await this.prismaService.user.findFirst({ where: { id } });

      if (!user) notFound(`User`, id);

      await this.prismaService.incidentReport.create({
        data: createIncidentReportDto,
      });
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async findAll(query: FindAllDto) {
    try {
      const { search, statusId } = query;

      const where: Prisma.IncidentReportWhereInput = search
        ? {
            statusId,
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                reportDescription: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                reportedDepartmentExplanation: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                sanction: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                reporter: {
                  firstName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {
            statusId,
          };

      const incidentReports = await this.prismaService.incidentReport.findMany({
        where,

        include: {
          reporter: true,
          reportedDepartment: true,
          reportingDepartment: true,
          status: true,
          evidences: true,
          comments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const count = await this.prismaService.incidentReport.count({ where });

      return {
        message: `Incident Report`,
        incidentReports,
        count,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async findOne(id: number) {
    try {
      const incidentReport = await this.prismaService.incidentReport.findFirst({
        where: { id },
        include: {
          reporter: true,
          reportedDepartment: true,
          reportingDepartment: true,
          status: true,
          evidences: true,
          comments: true,
        },
      });

      if (!incidentReport) notFound(`Incident Report`, id);

      return {
        message: `Incident Report loaded successfully`,
        incidentReport,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async update(
    incidentReportId: number,
    updateIncidentReportDto: UpdateIncidentReportDto,
    accessToken: string,
  ) {
    try {
      const id = extractUserId(accessToken, this.jwtService);

      const [user, incidentReport] = await Promise.all([
        this.prismaService.user.findFirst({ where: { id } }),
        this.prismaService.incidentReport.findFirst({
          where: { id: incidentReportId },
        }),
      ]);

      if (!user) notFound(`User`, id);
      if (!incidentReport) notFound(`Incident Report`, incidentReportId);

      await this.prismaService.incidentReport.update({
        where: { id: incidentReportId },
        data: updateIncidentReportDto,
      });

      return {
        message: `Incident report successfully updated`,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async remove(id: number) {
    try {
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }
}
