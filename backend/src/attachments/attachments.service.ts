import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = process.env.UPLOAD_DIR || '/app/uploads';

  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findByProjectId(projectId: string): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { project_id: projectId },
      order: { uploaded_at: 'DESC' },
    });
  }

  async create(
    projectId: string,
    title: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    // Generate unique stored name
    const ext = path.extname(file.originalname);
    const storedName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(this.uploadDir, storedName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save metadata to DB
    const attachment = this.attachmentsRepository.create({
      project_id: projectId,
      title,
      original_name: file.originalname,
      stored_name: storedName,
      file_size: file.size,
    });
    return this.attachmentsRepository.save(attachment);
  }

  async delete(id: string): Promise<void> {
    const attachment = await this.attachmentsRepository.findOne({ where: { id } });
    if (attachment) {
      // Delete file from disk
      const filePath = path.join(this.uploadDir, attachment.stored_name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Delete from DB
      await this.attachmentsRepository.delete(id);
    }
  }

  async getFilePath(id: string): Promise<{ path: string; name: string } | null> {
    const attachment = await this.attachmentsRepository.findOne({ where: { id } });
    if (!attachment) return null;
    const filePath = path.join(this.uploadDir, attachment.stored_name);
    if (!fs.existsSync(filePath)) return null;
    return { path: filePath, name: attachment.original_name };
  }
}
