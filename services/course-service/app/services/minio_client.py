from minio import Minio
from minio.error import S3Error
from app.config import settings

client = Minio(
    settings.minio_endpoint.replace('http://', '').replace('https://', ''),
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    secure=settings.minio_endpoint.startswith('https')
)


def ensure_bucket(bucket_name: str):
    try:
        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
    except S3Error:
        raise


def upload_media(bucket_name: str, object_name: str, data, content_type: str):
    ensure_bucket(bucket_name)
    length = None
    try:
        length = len(data)
    except TypeError:
        try:
            data.seek(0, 2)
            length = data.tell()
            data.seek(0)
        except Exception:
            pass

    client.put_object(
        bucket_name,
        object_name,
        data=data,
        length=length,
        content_type=content_type
    )


def build_media_url(bucket_name: str, object_name: str) -> str:
    return f"{settings.minio_url}/{bucket_name}/{object_name}"
