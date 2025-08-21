"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  Button,
  Stack,
  Alert,
  Group, Loader,
  Text,
  Paper,
  Container,
  FileInput,

  Card,
  List,
  ThemeIcon
} from '@mantine/core';
import {
  IconUpload,
  IconFileSpreadsheet,
  IconAlertCircle,
  IconCheck,
  IconDownload,

  IconBook,
  IconFileExcel,
  IconInfoCircle,
} from '@tabler/icons-react';


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedSectionId, setUploadedSectionId] = useState<number | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file || !sectionName) {
      setError("Please provide a section name and select a file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sectionName", sectionName);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setUploadedSectionId(data.sectionId);
      } else {
        if (response.status === 413) {
          setError("File is too large. Please upload a file smaller than 5MB.");
        } else {
          setError(data.message || "File upload failed.");
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/Loading_Template.xlsx';
    link.download = 'Hebrew_Flashcards_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartStudying = () => {
    if (uploadedSectionId) {
      router.push(`/study?sectionId=${uploadedSectionId}`);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-bg-primary to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(94,114,228,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/5 rounded-full blur-lg animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-accent/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Container size="md" className="w-full max-w-2xl">
            <Stack gap="xl" align="center">
              {/* Welcome Section */}
              <Stack gap="sm" align="center" className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl mb-2">
                  <IconUpload size={32} className="text-accent" />
                </div>
                
                <Text size="2rem" fw={700} className="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                  Upload Custom Section
                </Text>
                <Text size="lg" c="dimmed" className="max-w-md">
                  Create your own Hebrew vocabulary section by uploading an Excel file
                </Text>
              </Stack>

              {/* Success State */}
              {success && uploadedSectionId && (
                <Paper
                  shadow="xl"
                  radius="xl"
                  p="xl"
                  className="w-full bg-green-50/80 backdrop-blur-xl border border-green-200/50"
                >
                  <Stack gap="lg" align="center">
                    <ThemeIcon size={60} radius="xl" className="bg-green-500">
                      <IconCheck size={30} className="text-white" />
                    </ThemeIcon>
                    
                    <Stack gap="sm" align="center">
                      <Text size="xl" fw={600} className="text-green-800">
                        Section Created Successfully!
                      </Text>
                      <Text size="md" c="dimmed" ta="center">
                        Your custom vocabulary section &quot;{sectionName}&quot; has been uploaded and is ready to study.
                      </Text>
                    </Stack>

                    <Group gap="md" className="w-full" grow>
                      <Button
                        size="md"
                        leftSection={<IconBook size={18} />}
                        onClick={handleStartStudying}
                        className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #5e72e4 0%, #5a67d8 100%)'
                        }}
                      >
                        Start Studying
                      </Button>
                      
                      <Button
                        size="md"
                        variant="light"
                        onClick={handleGoToDashboard}
                        className="text-accent hover:text-accent/80 bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Go to Dashboard
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}

              {/* Upload Form */}
              {!success && (
                <>
                  {/* Template Download Card */}
                  <Card
                    shadow="md"
                    radius="lg"
                    p="lg"
                    className="w-full bg-blue-50/50 border border-blue-200/50"
                  >
                    <Group gap="md">
                      <ThemeIcon size={48} radius="xl" className="bg-blue-500">
                        <IconFileExcel size={24} className="text-white" />
                      </ThemeIcon>
                      
                      <div className="flex-1">
                        <Text size="lg" fw={600} className="text-blue-800">
                          Need a template?
                        </Text>
                        <Text size="sm" c="dimmed">
                          Download our Excel template with the correct format for Hebrew and English columns.
                        </Text>
                      </div>
                      
                      <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={handleDownloadTemplate}
                        className="text-blue-600 hover:text-blue-700 bg-blue-100/50 hover:bg-blue-100"
                      >
                        Download Template
                      </Button>
                    </Group>
                  </Card>

                  {/* Upload Form */}
                  <Paper
                    shadow="xl"
                    radius="xl"
                    p="xl"
                    className="w-full bg-bg-card/80 backdrop-blur-xl border border-bg-secondary/50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <form onSubmit={handleSubmit}>
                      <Stack gap="lg">
                        {/* Section Name Field */}
                        <TextInput
                          label="Section Name"
                          placeholder="Enter a name for your vocabulary section"
                          size="md"
                          leftSection={<IconFileSpreadsheet size={18} className="text-text-secondary" />}
                          value={sectionName}
                          onChange={(event) => setSectionName(event.currentTarget.value)}
                          required
                          classNames={{
                            input: 'border-bg-secondary/50 focus:border-accent transition-colors duration-200',
                            label: 'font-medium text-text-primary mb-2'
                          }}
                        />

                        {/* File Upload Field */}
                        <FileInput
                          label="Excel File"
                          placeholder="Select your .xlsx or .xls file"
                          size="md"
                          leftSection={<IconFileExcel size={18} className="text-text-secondary" />}
                          value={file}
                          onChange={setFile}
                          accept=".xlsx,.xls"
                          required
                          classNames={{
                            input: 'border-bg-secondary/50 focus:border-accent transition-colors duration-200',
                            label: 'font-medium text-text-primary mb-2'
                          }}
                        />

                        {/* File Requirements */}
                        <Alert
                          variant="light"
                          color="blue"
                          icon={<IconInfoCircle size={18} />}
                          classNames={{
                            root: 'border-blue-200 bg-blue-50/50',
                            icon: 'text-blue-500',
                            message: 'text-blue-700'
                          }}
                        >
                          <Text size="sm" fw={500} mb="xs">File Requirements:</Text>
                          <List size="sm" spacing="xs">
                            <List.Item>First column: Hebrew words</List.Item>
                            <List.Item>Second column: English translations</List.Item>
                            <List.Item>Maximum 500 words per file</List.Item>
                            <List.Item>File size limit: 5MB</List.Item>
                          </List>
                        </Alert>

                        {/* Error Alert */}
                        {error && (
                          <Alert 
                            color="red" 
                            variant="light" 
                            icon={<IconAlertCircle size={18} />}
                            classNames={{
                              root: 'border-red-200 bg-red-50/50',
                              icon: 'text-red-500',
                              message: 'text-red-700'
                            }}
                          >
                            {error}
                          </Alert>
                        )}

                        {/* Upload Button */}
                        <Button
                          type="submit"
                          size="md"
                          fullWidth
                          leftSection={loading ? <Loader size={18} color="white" /> : <IconUpload size={18} />}
                          loading={loading}
                          className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: loading ? undefined : 'linear-gradient(135deg, #5e72e4 0%, #5a67d8 100%)'
                          }}
                        >
                          {loading ? 'Uploading...' : 'Upload Section'}
                        </Button>
                      </Stack>
                    </form>
                  </Paper>
                </>
              )}
            </Stack>
          </Container>
        </div>

        {/* Bottom Decoration */}
        <div className="flex-shrink-0 h-2 bg-gradient-to-r from-accent via-purple-500 to-blue-500" />
      </div>
    </div>
  );
}