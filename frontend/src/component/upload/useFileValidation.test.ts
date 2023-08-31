import { renderHook, act } from '@testing-library/react';
import { useFileValidation } from './useFileValidation';

describe('useFileValidation', () => {
  const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
  const nonVideoFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
  const unknownVideoFile = new File(['unknown content'], 'test.unknown', { type: 'video/unknown' });

  describe('validateFile', () => {
    it('should validate and accept video files', () => {
      const { result } = renderHook(() => useFileValidation());

      act(() => {
        result.current.validateFile(videoFile);
      });

      expect(result.current.selectedFile?.name).toBe('test.mp4');
      expect(result.current.error).toBe(null);
    });

    it('should reject non-video files', () => {
      const { result } = renderHook(() => useFileValidation());

      act(() => {
        result.current.validateFile(nonVideoFile);
      });

      expect(result.current.selectedFile).toBe(null);
      expect(result.current.error).toBe('Please upload a video file');
    });

    it('should handle unknown video formats', () => {
      const { result } = renderHook(() => useFileValidation());

      act(() => {
        result.current.validateFile(unknownVideoFile);
      });

      expect(result.current.selectedFile?.name).toBe('test.unknown');
      expect(result.current.error).toBe(null);
    });
  });

  describe('setSelectedFile', () => {
    it('should set selected file correctly', () => {
      const { result } = renderHook(() => useFileValidation());
      
      act(() => {
        result.current.setSelectedFile(videoFile);
      });

      expect(result.current.selectedFile?.name).toBe('test.mp4');
    });
  });

  describe('setError', () => {
    it('should set error correctly', () => {
      const { result } = renderHook(() => useFileValidation());
      
      act(() => {
        result.current.setError('error message');
      });

      expect(result.current.error).toBe('error message');
    });
  });
});
