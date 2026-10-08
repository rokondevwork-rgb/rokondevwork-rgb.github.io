---
title: "SSH Key Authentication & Secure Remote Server Connection"
description: "How SSH key authentication works: generating keys, authorized_keys, the login flow, and best practices for secure server access."
pubDate: 2026-10-08
tags: ["SSH", "Linux", "Security"]
draft: false
---

## What is SSH?

SSH (Secure Shell) is a secure network protocol used to connect to remote servers securely over an encrypted connection.

Example:

```bash
ssh ubuntu@your-server-ip
```

SSH allows you to:

* Access remote Linux servers
* Transfer files securely
* Execute commands remotely
* Manage servers safely over the internet

---

## What is SSH Key Authentication?

SSH key authentication is a secure login method that uses:

* A **Private Key** (stored on your local machine)
* A **Public Key** (stored on the remote server)

This method is based on:

### Public Key Cryptography (Asymmetric Encryption)

Instead of using passwords, SSH verifies identity using mathematically related keys.

---

## How SSH Key Authentication Works

### Step 1 — Generate SSH Keys

Example:

```bash
ssh-keygen -t ed25519 -C "server1-to-server2"
```

This creates:

```text
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

| File             | Purpose                        |
| ---------------- | ------------------------------ |
| `id_ed25519`     | Private Key (keep secret)      |
| `id_ed25519.pub` | Public Key (share with server) |

---

## Understanding Key Types (Algorithms)

SSH supports multiple cryptographic algorithms.

| Algorithm | Description                                   | Recommended |
| --------- | --------------------------------------------- | ----------- |
| `ed25519` | Modern, fast, secure elliptic curve algorithm | ✅ Yes       |
| `rsa`     | Older but widely compatible                   | Sometimes   |
| `ecdsa`   | Elliptic curve algorithm                      | Optional    |

---

## Example Public Keys

### ED25519 Key

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyData user@pc
```

### RSA Key

```text
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@pc
```

The first part indicates the algorithm:

* `ssh-ed25519`
* `ssh-rsa`

---

## What is `authorized_keys`?

`authorized_keys` is NOT an algorithm.

It is simply a file on the server that stores trusted public keys.

Location:

```text
~/.ssh/authorized_keys
```

Example content:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...
```

If your public key exists in this file, the server allows authentication.

---

## SSH Authentication Process

### Step-by-Step Flow

#### Step 1

Your SSH client connects to the server.

```bash
ssh ubuntu@server-ip
```

---

#### Step 2

The client says:

```text
"I own the private key for this public key."
```

---

#### Step 3

The server checks:

```text
Is this public key inside authorized_keys?
```

---

#### Step 4

The server sends a random cryptographic challenge.

---

#### Step 5

Your private key signs the challenge.

---

#### Step 6

The server verifies the signature using the public key.

If verification succeeds:

```text
Authentication Successful
```

You are logged in securely without a password.

---

## Important Security Concept

### Private Key Never Leaves Your Computer

Only the cryptographic proof/signature is transmitted.

This is why SSH key authentication is highly secure.

---

## SSH Connection Architecture

```text
+------------------+
|   Your Computer  |
|  SSH Client      |
|  Private Key     |
+------------------+
          |
          | Encrypted SSH Connection
          |
          v
+------------------+
| Remote Server    |
| sshd Service     |
| authorized_keys  |
+------------------+
```

---

## SSH Server Component

On Linux servers, the SSH daemon handles connections.

Service name:

```text
sshd
```

Check SSH service status:

```bash
sudo systemctl status ssh
```

or:

```bash
sudo systemctl status sshd
```

---

## Technologies Used in SSH

| Technology                  | Purpose                     |
| --------------------------- | --------------------------- |
| SSH Protocol                | Secure remote communication |
| Public Key Cryptography     | Authentication              |
| AES / ChaCha20              | Data encryption             |
| SHA-2                       | Integrity verification      |
| Diffie-Hellman / Curve25519 | Secure key exchange         |

---

## Advantages of SSH Key Authentication

| Advantage                | Description                          |
| ------------------------ | ------------------------------------ |
| More Secure              | No password transmitted over network |
| Resistant to Brute Force | Harder to attack than passwords      |
| Faster Login             | No need to type passwords            |
| Automation Friendly      | Useful for scripts and CI/CD         |
| Encrypted Communication  | Entire session is encrypted          |
| Easy Server Management   | Secure access to multiple servers    |

---

## Disadvantages of SSH Key Authentication

| Disadvantage            | Description                           |
| ----------------------- | ------------------------------------- |
| Key Management Required | Must securely manage private keys     |
| Private Key Loss        | Losing the key may block access       |
| Misconfiguration Risk   | Incorrect permissions can break login |
| Shared Keys Risk        | Sharing private keys is dangerous     |
| Learning Curve          | Beginners may find setup difficult    |

---

## Useful SSH Commands

### Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "my-server"
```

---

### Copy Public Key to Server

```bash
ssh-copy-id ubuntu@server-ip
```

---

### Check Existing SSH Keys

```bash
ls ~/.ssh
```

---

### View Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

---

### Check Key Type

```bash
ssh-keygen -l -f ~/.ssh/id_ed25519.pub
```

Example output:

```text
256 SHA256:xxxxx user@pc (ED25519)
```

---

## Recommended Best Practices

| Practice               | Recommendation                       |
| ---------------------- | ------------------------------------ |
| Use ED25519            | Modern and secure                    |
| Protect Private Keys   | Never share them                     |
| Use Passphrases        | Add extra security                   |
| Disable Password Login | After SSH keys are configured        |
| Backup Keys Securely   | Prevent accidental lockout           |
| Use Separate Keys      | Different keys for different servers |

---

## Conclusion

SSH key authentication is a secure and modern method for accessing remote servers.

It combines:

* SSH protocol
* Public key cryptography
* Encrypted communication
* Secure authentication

This system allows password-less and highly secure server access while protecting data during transmission.
