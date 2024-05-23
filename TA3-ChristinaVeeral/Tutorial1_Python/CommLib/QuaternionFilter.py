import math
import time
import numpy as np


class QuaternionFilter:
    def __init__(self):
        # Parameters for Madgwick filter
        self.beta = math.sqrt(3.0 / 4.0) * (math.pi * 40.0 / 180.0)
        self.zeta = math.sqrt(3.0 / 4.0) * (math.pi * 0.0 / 180.0)

        # Parameters for Mahony filter
        self.Kp = 30.0
        self.Ki = 0.0

        # Common variables
        self.deltaT = 0.0
        self.oldTime = 0

        # Quaternion
        self.q = [1.0, 0.0, 0.0, 0.0]

    def update(self, ax, ay, az, gx, gy, gz, mx, my, mz):
        newTime = time.time()
        self.deltaT = newTime - self.oldTime if self.oldTime != 0 else 0
        self.oldTime = newTime

        # Normalize accelerometer and magnetometer readings
        a_norm = math.sqrt(ax**2 + ay**2 + az**2)
        if a_norm == 0.0:
            return  # Avoid division by zero
        ax /= a_norm
        ay /= a_norm
        az /= a_norm

        m_norm = math.sqrt(mx**2 + my**2 + mz**2)
        if m_norm == 0.0:
            return  # Avoid division by zero
        mx /= m_norm
        my /= m_norm
        mz /= m_norm

        # Madgwick filter
        q_madgwick = self.madgwick(ax, ay, az, gx, gy, gz, mx, my, mz)

        # Mahony filter
        q_mahony = self.mahony(ax, ay, az, gx, gy, gz, mx, my, mz)

        return q_madgwick, q_mahony

    def madgwick(self, ax, ay, az, gx, gy, gz, mx, my, mz):
        q0, q1, q2, q3 = self.q
        beta = self.beta
        zeta = self.zeta

        qDot1 = 0.5 * (-q1 * gx - q2 * gy - q3 * gz)
        qDot2 = 0.5 * (q0 * gx + q2 * gz - q3 * gy)
        qDot3 = 0.5 * (q0 * gy - q1 * gz + q3 * gx)
        qDot4 = 0.5 * (q0 * gz + q1 * gy - q2 * gx)

        a_norm = math.sqrt(ax**2 + ay**2 + az**2)
        if a_norm == 0.0:
            return self.q
        ax /= a_norm
        ay /= a_norm
        az /= a_norm

        m_norm = math.sqrt(mx**2 + my**2 + mz**2)
        if m_norm == 0.0:
            return self.q
        mx /= m_norm
        my /= m_norm
        mz /= m_norm

        _2q0mx = 2.0 * q0 * mx
        _2q0my = 2.0 * q0 * my
        _2q0mz = 2.0 * q0 * mz
        _2q1mx = 2.0 * q1 * mx
        _2q1my = 2.0 * q1 * my
        _2q1mz = 2.0 * q1 * mz
        _2q2mx = 2.0 * q2 * mx
        _2q2my = 2.0 * q2 * my
        _2q2mz = 2.0 * q2 * mz
        _2q3mx = 2.0 * q3 * mx
        _2q3my = 2.0 * q3 * my
        _2q3mz = 2.0 * q3 * mz

        s0 = qDot1 - (beta * a_norm) * q0
        s1 = qDot2 + (beta * a_norm) * q1
        s2 = qDot3 + (beta * a_norm) * q2
        s3 = qDot4 - (beta * a_norm) * q3

        qDot1 -= zeta * q1
        qDot2 -= zeta * q2
        qDot3 -= zeta * q3

        q0 += qDot1 * self.deltaT
        q1 += qDot2 * self.deltaT
        q2 += qDot3 * self.deltaT
        q3 += qDot4 * self.deltaT

        recipNorm = 1.0 / math.sqrt(q0**2 + q1**2 + q2**2 + q3**2)
        q0 *= recipNorm
        q1 *= recipNorm
        q2 *= recipNorm
        q3 *= recipNorm

        self.q = [q0, q1, q2, q3]

        return self.q

    def calculate_roll_pitch_yaw(quat_filter):
        q = quat_filter.get_quaternion()  # Assuming this method exists to get the current quaternion
        q0, q1, q2, q3 = q[0], q[1], q[2], q[3]

        roll = np.arctan2(2 * (q0 * q1 + q2 * q3), 1 - 2 * (q1 * q1 + q2 * q2))
        pitch = np.arcsin(2 * (q0 * q2 - q3 * q1))
        yaw = np.arctan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3))

        roll = np.degrees(roll)
        pitch = np.degrees(pitch)
        yaw = np.degrees(yaw)

        return roll, pitch, yaw

    def mahony(self, ax, ay, az, gx, gy, gz, mx, my, mz):
        q0, q1, q2, q3 = self.q
        Kp = self.Kp
        Ki = self.Ki

        recipNorm = 0.0
        vx, vy, vz = 0.0, 0.0, 0.0
        ex, ey, ez = 0.0, 0.0, 0.0
        qa, qb, qc = 0.0, 0.0, 0.0
        ix, iy, iz = 0.0, 0.0, 0.0

        a_norm = math.sqrt(ax**2 + ay**2 + az**2)
        if a_norm == 0.0:
            return self.q
                
        ax /= a_norm
        ay /= a_norm
        az /= a_norm

        m_norm = math.sqrt(mx**2 + my**2 + mz**2)
        if m_norm == 0.0:
            return self.q
        mx /= m_norm
        my /= m_norm
        mz /= m_norm

        vx = q1*q3 - q0*q2
        vy = q0*q1 + q2*q3
        vz = q0*q0 - 0.5 + q3*q3

        ex = ay*vz - az*vy
        ey = az*vx - ax*vz
        ez = ax*vy - ay*vx

        if Ki > 0.0:
            ix += Ki * ex * self.deltaT
            iy += Ki * ey * self.deltaT
            iz += Ki * ez * self.deltaT
            gx += ix
            gy += iy
            gz += iz

        gx += Kp * ex
        gy += Kp * ey
        gz += Kp * ez

        self.deltaT *= 0.5
        gx *= self.deltaT
        gy *= self.deltaT
        gz *= self.deltaT

        qa = q0
        qb = q1
        qc = q2

        q0 += (-qb * gx - qc * gy - q3 * gz)
        q1 += (qa * gx + qc * gz - q3 * gy)
        q2 += (qa * gy - qb * gz + q3 * gx)
        q3 += (qa * gz + qb * gy - qc * gx)

        recipNorm = 1.0 / math.sqrt(q0**2 + q1**2 + q2**2 + q3**2)
        q0 *= recipNorm
        q1 *= recipNorm
        q2 *= recipNorm
        q3 *= recipNorm

        self.q = [q0, q1, q2, q3]

        return self.q

