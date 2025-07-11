import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Logger,
  Query,
} from '@nestjs/common';
import { IncidentReportService } from './incident-report.service';
import { CreateIncidentReportDto } from './dto/create-incident-report.dto';
import { UpdateIncidentReportDto } from './dto/update-incident-report.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import extractAccessToken from 'src/utils/functions/extractAccessToken';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('incident-report')
export class IncidentReportController {
  private logger: Logger = new Logger(IncidentReportController.name);

  constructor(private readonly incidentReportService: IncidentReportService) {}

  @Post()
  @RateLimit({
    keyPrefix: 'create-incident-report',
    points: 150,
    duration: 5,
    errorMessage: 'Please wait before checking read status',
  })
  create(
    @Body() createIncidentReportDto: CreateIncidentReportDto,
    @Req() req: Request,
  ) {
    try {
      const accessToken = extractAccessToken(req);

      return this.incidentReportService.create(
        createIncidentReportDto,
        accessToken,
      );
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  @Get()
  @RateLimit({
    keyPrefix: 'find_all_incident_reports',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching all incident reports.',
  })
  findAll(@Query() query: FindAllDto) {
    return this.incidentReportService.findAll(query);
  }

  @Get(':incidentReportId')
  @RateLimit({
    keyPrefix: 'find-one-IR',
    points: 150,
    duration: 5,
    errorMessage: 'Please wait before finding one IR',
  })
  findOne(@Param('incidentReportId') incidentReportId: number) {
    return this.incidentReportService.findOne(incidentReportId);
  }

  @Patch(':incidentReportId')
  @RateLimit({
    keyPrefix: 'update-IR',
    points: 150,
    duration: 5,
    errorMessage: 'Please wait before updating IR',
  })
  update(
    @Param('incidentReportId') incidentReportId: number,
    @Body() updateIncidentReportDto: UpdateIncidentReportDto,
    @Req() req: Request,
  ) {
    try {
      const accessToken = extractAccessToken(req);

      return this.incidentReportService.update(
        incidentReportId,
        updateIncidentReportDto,
        accessToken,
      );
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  @Delete(':incidentReportId')
  remove(@Param('incidentReportId') incidentReportId: number) {
    return this.incidentReportService.remove(incidentReportId);
  }

  @Get(':id/counts')
  @RateLimit({
    keyPrefix: 'IR-counts',
    points: 150,
    duration: 5,
    errorMessage: 'Please wait before getting IR counts',
  })
  getIncidentReportCounts() {
    return this.incidentReportService.getCounts();
  }
}
